import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CONTENT_PATHS = /^\/(learn|evm|node|cosmos-sdk)(\/|$)/;
const SKIP_PATHS = /\.(css|js|json|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|map|txt|md|xml)$|^\/(api|_next|assets|_pagefind)\//;

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname.endsWith('.md')) {
		const cleanPath = pathname.slice(0, -3);
		const url = request.nextUrl.clone();
		url.pathname = `/api/llm-md${cleanPath}`;
		return NextResponse.rewrite(url);
	}

	if (!SKIP_PATHS.test(pathname)) {
		const accept = request.headers.get('accept') || '';
		if (accept.includes('text/markdown') && CONTENT_PATHS.test(pathname)) {
			const rewriteUrl = request.nextUrl.clone();
			rewriteUrl.pathname = `${pathname}.md`;
			return NextResponse.rewrite(rewriteUrl);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next|_pagefind|_scraped-docs|assets|favicon).*)']
};
