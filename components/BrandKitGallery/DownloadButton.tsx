import React from 'react';
import { DownloadIcon } from 'lucide-react';

interface DownloadButtonProps {
	url: string;
	fileName: string;
	children: React.ReactNode;
}

export default function DownloadButton({ url, fileName, children }: DownloadButtonProps) {
	function handleDownload() {
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', fileName);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	return (
		<button
			onClick={handleDownload}
			className='
        inline-flex 
        items-center 
        px-4 
        py-1.5 
        font-semibold 
        bg-black 
        text-white 
        rounded-lg 
        hover:bg-gray-800 
        dark:bg-white 
        dark:text-black 
        dark:hover:bg-gray-200 
        transition-all 
        duration-200 
        active:translate-y-px
      '>
			{children}
			<DownloadIcon className='w-4 h-4 ml-2' />
		</button>
	);
}
