'use client';

import React, { useEffect, useState } from 'react';
import { IconSun, IconMoon } from '@tabler/icons-react';

interface ThemeToggleProps {}

export function ThemeToggle({}: ThemeToggleProps) {
	const [theme, setTheme] = useState<'light' | 'dark'>('dark');

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (savedTheme) {
			setTheme(savedTheme as 'light' | 'dark');
			document.documentElement.classList.toggle('dark', savedTheme === 'dark');
		} else if (prefersDark) {
			setTheme('dark');
			document.documentElement.classList.add('dark');
		} else {
			setTheme('light');
			document.documentElement.classList.remove('dark');
		}
	}, []);

	const toggleTheme = () => {
		const newTheme = theme === 'dark' ? 'light' : 'dark';
		setTheme(newTheme);
		document.documentElement.classList.toggle('dark', newTheme === 'dark');
		localStorage.setItem('theme', newTheme);
	};

	return (
		<button
			onClick={toggleTheme}
			className='p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all'
			aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
			{theme === 'dark' ? <IconSun className='h-5 w-5' /> : <IconMoon className='h-5 w-5' />}
		</button>
	);
}
