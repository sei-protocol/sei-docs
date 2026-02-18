import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname.endsWith('.md')) {
		const cleanPath = pathname.slice(0, -3);
		const url = request.nextUrl.clone();
		url.pathname = `/api/llm-md${cleanPath}`;
		return NextResponse.rewrite(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next|_pagefind|_scraped-docs|assets|favicon).+\\.md)']
};
