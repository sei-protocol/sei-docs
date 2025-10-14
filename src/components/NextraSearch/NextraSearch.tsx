'use client';

import React from 'react';
import { Search } from 'nextra/components';

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
