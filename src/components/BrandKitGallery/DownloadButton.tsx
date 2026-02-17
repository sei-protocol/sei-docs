'use client';

import { IconDownload } from '@tabler/icons-react';

const DownloadButton = ({ url, fileName, children }) => {
	const handleDownload = () => {
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', fileName);
		// TODO: add target blank
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<button
			className='inline-flex items-center px-4 py-1.5 font-semibold bg-black text-white rounded-sm hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all duration-200 active:translate-y-px'
			onClick={handleDownload}>
			{children} <IconDownload className='w-4 h-4 ml-2' />
		</button>
	);
};

export default DownloadButton;
