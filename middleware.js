import { NextResponse } from 'next/server';

const CONTENT_PATHS = /^\/(learn|evm|node|cosmos-sdk)(\/|$)/;

const SKIP_PATHS = /\.(css|js|json|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|map|txt|md|xml)$|^\/(api|_next|assets|_pagefind)\//;

export function middleware(request) {
	const { pathname } = request.nextUrl;

	if (SKIP_PATHS.test(pathname)) return NextResponse.next();

	const accept = request.headers.get('accept') || '';
	if (!accept.includes('text/markdown')) return NextResponse.next();

	if (!CONTENT_PATHS.test(pathname)) return NextResponse.next();

	const rewriteUrl = request.nextUrl.clone();
	rewriteUrl.pathname = `${pathname}.md`;
	return NextResponse.rewrite(rewriteUrl);
}

export const config = {
	matcher: ['/((?!api|_next|assets|_pagefind).*)']
};
