//@ts-nocheck
import {Browser, chromium, Page, Response} from "@playwright/test";
import * as fs from "node:fs";

const brokenLinks = new Set<string>();
const visitedLinks = new Set<string>();

async function main() {
	const browserInstance = await chromium.launch();
	const baseUrl = 'https://www.docs.sei.io/';
	await crawlPages(baseUrl, browserInstance, 'main');

	fs.writeFileSync('brokenLinks.json', JSON.stringify([...brokenLinks], null, 2));

	if (brokenLinks.size > 0) {
		throw new Error(`Found broken links: ${brokenLinks.size} broken links.`);
	}
	console.info('Finished checking links');
}

async function crawlPages(url: string, browser: Browser, path: string) {
	const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.81"
	const page = await browser.newPage({userAgent: ua});
	console.info('Visiting: ' + path);
	if(isInternal(url)){
		await checkInternalLinks(url, page, path, browser);
	} else {
		await checkExternalLinks(url, page, path, browser);
	}
}

function isInternal(url: string) {
	return url.includes('docs.sei');
}

async function checkInternalLinks(url: string, page: Page, path: string, browser: Browser) {
	const isBroken = await isLinkBroken(page, url, path);
	visitedLinks.add(url);
	if (isBroken) {
		await page.close();
		return;
	}
	const linksToCheck = await getLinksFromPage(page, path);
	await page.close();
	for (const link of linksToCheck){
		await crawlPages(link, browser, `${url} => ${link}`)
	}
}

async function checkExternalLinks(url: string, page: Page, path: string, browser: Browser) {
	if (path.includes('learn/getting-tokens')) return;
	await isLinkBroken(page, url, path);
	visitedLinks.add(url);
	await page.close();
	return;
}

async function isLinkBroken(page: Page, url: string, path: string) {
	if (visitedLinks.has(url)) return false;
	if (url.includes('localhost') || url.includes('.tar.gz')) return false;

	let pageResponse: Response;
	try {
		pageResponse = await page.goto(url, {waitUntil: 'load', timeout: 15000});
	} catch (error: any) {
		if (error.message.includes('Timeout')) {
			pageResponse = await retryPageLoadIfTimeout(page, url);
		}
	} finally {
		if (!pageResponse || [404, 403].includes(pageResponse.status())) {
			console.warn(`Broken link detected: ${path} (Status ${pageResponse ? pageResponse.status() : 'page not opened'})`);
			brokenLinks.add(path);
			return true;
		}
		return false;
	}
}

async function retryPageLoadIfTimeout(page: Page, url: string, path: string) {
	try {
		return await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
	} catch {
		return undefined;
	}
}

async function getLinksFromPage(page: Page, path: string) {
	const node = path === 'main' ? 'a' : 'main a';
	const linksOnPage = await page.$$eval(node, links =>
		links.map(link => link.href)
	);
	return linksOnPage.filter(href => !visitedLinks.has(href)).filter(href => {
		if (isInternal(href)) return !href.includes('#');
		return true;
	});
}

main().then(() => console.log('Finished checks'));