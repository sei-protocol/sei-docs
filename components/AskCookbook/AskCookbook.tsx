import React from 'react';
import dynamic from 'next/dynamic';

interface CookbookProps {
	apiKey: string;
}

const BaseAskCookbook = dynamic<CookbookProps>(() => import('@cookbookdev/docsbot/react').then((mod) => mod.default || mod), { ssr: false });

const COOKBOOK_PUBLIC_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const AskCookbook = () => {
	return <BaseAskCookbook apiKey={COOKBOOK_PUBLIC_API_KEY} />;
};
