declare module 'nextra/dist/client/components' {
	import type { FC, ReactElement } from 'react';

	export type PagefindSearchOptions = any;

	export type SearchProps = {
		emptyResult?: ReactElement | string;
		errorText?: ReactElement | string;
		loading?: ReactElement | string;
		placeholder?: string;
		className?: string;
		searchOptions?: PagefindSearchOptions;
	};

	export const Search: FC<SearchProps>;
}

declare module 'nextra/dist/client/components/search.js' {
	export * from 'nextra/dist/client/components';
}
