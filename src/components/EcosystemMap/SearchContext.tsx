import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
	searchTerm: string;
	setSearchTerm: (v: string) => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
	const [searchTerm, setSearchTerm] = useState('');
	return <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>{children}</SearchContext.Provider>;
}

export function useSearch() {
	const ctx = useContext(SearchContext);
	if (!ctx) {
		throw new Error('useSearch() must be used within <SearchProvider>');
	}
	return ctx;
}
