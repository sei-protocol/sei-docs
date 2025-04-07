//@ts-ignore
import { Browser, chromium, Page, Response } from "@playwright/test";
import * as fs from "node:fs";

const brokenLinks = new Set<string>();
const visitedLinks = new Set<string>();
const linkQueue: { url: string, path: string }[] = [];
const MAX_PAGES = 5;
let activeCount = 0;

async function main() {
	const browserInstance = await chromium.launch();
	const baseUrl = process.env.BASE_URL || 'https://www.docs.sei.io/';
	linkQueue.push({ url: baseUrl, path: 'main' });

	const workers = [];
	for (let i = 0; i < MAX_PAGES; i++) {
		workers.push(worker(browserInstance, i));
	}
	await Promise.all(workers);

	fs.writeFileSync('brokenLinks.json', JSON.stringify([...brokenLinks], null, 2));

	if (brokenLinks.size > 0) {
		throw new Error(`Found broken links: ${brokenLinks.size} broken links.`);
	}
	console.info('Finished checking links');
	await browserInstance.close();
}

async function worker(browser: Browser, workerId: number) {
	const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.81";
	while (true) {
		const currentTask = linkQueue.shift();

		if (!currentTask) {
			if (linkQueue.length === 0 && activeCount === 0) break;
			await new Promise(res => setTimeout(res, 100));
			continue;
		}

		activeCount++;
		const { url, path } = currentTask;

		if (visitedLinks.has(url)) {
			activeCount--;
			continue;
		}
		visitedLinks.add(url);

		console.info(`Worker ${workerId} visiting: ${path}`);
		const page = await browser.newPage({ userAgent: ua });
		try {
			if (isInternal(url)) {
				const isBroken = await isLinkBroken(page, url, path);
				if (!isBroken) {
					const links = await getLinksFromPage(page, path);
					links.forEach(link => {
						if (!visitedLinks.has(link)) {
							linkQueue.push({ url: link, path: `${path} => ${link}` });
						}
					});
				}
			} else {
				if (!path.includes('learn/getting-tokens')) {
					await isLinkBroken(page, url, path);
				}
			}
		} catch (error) {
			console.error(`Worker ${workerId} error processing ${url}: ${error}`);
		} finally {
			await page.close();
			activeCount--;
		}
	}
}

function isInternal(url: string) {
	return url.includes('docs.sei') || url.includes('localhost:3000');
}

async function isLinkBroken(page: Page, url: string, path: string) {
	if ((url.includes('localhost') && !url.includes(':3000')) || url.includes('.tar.gz')) return false;

	let pageResponse: Response;
	try {
		pageResponse = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
	} catch (error: any) {
		pageResponse = await retryPageLoadIfTimeout(page, url, path);
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
		return await page.goto(url, { waitUntil: 'load', timeout: 45000 });
	} catch(e: any) {
		return undefined;
	}
}

async function getLinksFromPage(page: Page, path: string) {
	const node = path === 'main' ? 'a' : 'main a';
	const linksOnPage = await page.$$eval(node, links =>
		links.map(link => link.href)
	);
	return linksOnPage
		.filter(href => !visitedLinks.has(href))
		.filter(href => {
			if (isInternal(href)) return !href.includes('#');
			return true;
		});
}

main().then(() => {
	console.log('Finished checking links');
	process.exit(0);
});
