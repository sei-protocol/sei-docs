'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './';

export default function TabsExample() {
	return (
		<div className='p-4 max-w-3xl mx-auto'>
			<h1 className='text-2xl font-bold mb-4'>Tabs Example</h1>

			<Tabs defaultValue='tab1'>
				<TabsList>
					<TabsTrigger value='tab1'>
						<div className='flex items-center gap-2'>
							<div className='h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center'>
								<span className='text-red-600 dark:text-red-400 font-bold'>1</span>
							</div>
							<span>First Tab</span>
						</div>
					</TabsTrigger>
					<TabsTrigger value='tab2'>
						<div className='flex items-center gap-2'>
							<div className='h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center'>
								<span className='text-red-600 dark:text-red-400 font-bold'>2</span>
							</div>
							<span>Second Tab</span>
						</div>
					</TabsTrigger>
					<TabsTrigger value='tab3'>
						<div className='flex items-center gap-2'>
							<div className='h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center'>
								<span className='text-red-600 dark:text-red-400 font-bold'>3</span>
							</div>
							<span>Third Tab</span>
						</div>
					</TabsTrigger>
				</TabsList>

				<TabsContent value='tab1'>
					<div className='space-y-4'>
						<h3 className='text-lg font-semibold'>First Tab Content</h3>
						<p>This is the content for the first tab. It demonstrates how the new Radix UI-based Tabs component works.</p>
						<div className='bg-neutral-900 text-neutral-300 p-3 rounded-md overflow-x-auto mb-3'>
							<pre>
								<code className='language-bash'>echo "This is a code example in the first tab"</code>
							</pre>
						</div>
					</div>
				</TabsContent>

				<TabsContent value='tab2'>
					<div className='space-y-4'>
						<h3 className='text-lg font-semibold'>Second Tab Content</h3>
						<p>Here's the content for the second tab. The Tabs component is built with Radix UI primitives for better accessibility.</p>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							<div className='border border-neutral-200 dark:border-neutral-700 rounded-lg p-4'>
								<h4 className='font-medium mb-2'>Feature 1</h4>
								<p className='text-sm text-neutral-600 dark:text-neutral-400'>Description of feature 1</p>
							</div>
							<div className='border border-neutral-200 dark:border-neutral-700 rounded-lg p-4'>
								<h4 className='font-medium mb-2'>Feature 2</h4>
								<p className='text-sm text-neutral-600 dark:text-neutral-400'>Description of feature 2</p>
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value='tab3'>
					<div className='space-y-4'>
						<h3 className='text-lg font-semibold'>Third Tab Content</h3>
						<p>And here's the content for the third tab. The styling matches the existing Tailwind designs in the project.</p>
						<ul className='list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400'>
							<li>The component follows the project's architectural patterns</li>
							<li>It uses Radix UI primitives for better accessibility</li>
							<li>The styling is done with Tailwind CSS, matching the existing design</li>
							<li>It maintains the same API as the previous implementation</li>
						</ul>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
