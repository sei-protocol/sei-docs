'use client';

import React from 'react';
import { atom, useAtom } from 'jotai';
import { TextField } from '@radix-ui/themes';
import { IconSearch } from '@tabler/icons-react';

export const searchTermAtom = atom('');

type EcosystemSearchBarProps = {
	placeholder: string;
};

export function EcosystemSearchBar({ placeholder }: EcosystemSearchBarProps) {
	const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);
	return (
		<TextField.Root size='3' className='w-full' placeholder={placeholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}>
			<TextField.Slot>
				<IconSearch height='16' width='16' />
			</TextField.Slot>
		</TextField.Root>
	);
}
