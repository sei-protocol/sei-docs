'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

interface TabsProps {
	defaultValue: string;
	className?: string;
	children: React.ReactNode;
}

interface TabsListProps {
	className?: string;
	children: React.ReactNode;
}

interface TabsTriggerProps {
	value: string;
	className?: string;
	children: React.ReactNode;
}

interface TabsContentProps {
	value: string;
	className?: string;
	children: React.ReactNode;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(({ defaultValue, className, children }, ref) => (
	<TabsPrimitive.Root ref={ref} defaultValue={defaultValue} className={className || 'w-full'}>
		{children}
	</TabsPrimitive.Root>
));
Tabs.displayName = 'Tabs';

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(({ className, children }, ref) => (
	<TabsPrimitive.List ref={ref} className={className || 'flex w-full border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden mb-4'}>
		{children}
	</TabsPrimitive.List>
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(({ className, value, children }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		value={value}
		className={
			className ||
			`flex-1 py-3 px-4 
				bg-white dark:bg-neutral-900/30 
				data-[state=active]:bg-neutral-50 dark:data-[state=active]:bg-neutral-800
				border-r border-neutral-200 dark:border-neutral-800 last:border-r-0
				transition-colors duration-200
				focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-500/10
				font-medium text-neutral-700 dark:text-neutral-300
				data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white`
		}>
		{children}
	</TabsPrimitive.Trigger>
));
TabsTrigger.displayName = 'TabsTrigger';

// TabsContent that renders both regular Radix content AND always visible content for indexing
export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(({ className, value, children }, ref) => {
	return (
		<>
			{/* Regular Radix TabsContent for interactive behavior */}
			<TabsPrimitive.Content
				ref={ref}
				value={value}
				className={
					className ||
					`mt-0 p-6 
						border border-neutral-200 dark:border-neutral-800 rounded-lg 
						bg-white dark:bg-neutral-900/30
						animate-in fade-in-0 zoom-in-95 duration-200`
				}>
				{children}
			</TabsPrimitive.Content>

			{/* Always visible content for search indexing (hidden visually but accessible to crawlers) */}
			<div data-search-content data-tab-value={value} className='sr-only' aria-hidden='true'>
				{children}
			</div>
		</>
	);
});
TabsContent.displayName = 'TabsContent';
