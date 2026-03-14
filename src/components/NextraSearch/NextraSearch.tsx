'use client';

import { Search } from 'nextra/components';
import type React from 'react';

export type NextraSearchProps = {
	emptyResult?: React.ReactElement | string;
	errorText?: React.ReactElement | string;
	loading?: React.ReactElement | string;
	placeholder?: string;
	className?: string;
	searchOptions?: any;
};

export default function NextraSearch(props: NextraSearchProps) {
	return <Search {...props} />;
}
