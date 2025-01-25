import React, { useEffect, useState } from 'react';

export default function InteractiveTerminal() {
	const [jsonData, setJsonData] = useState<any>(null);
	const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

	useEffect(() => {
		fetch('https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/sei/chain.json')
			.then((res) => res.json())
			.then((data) => setJsonData(data))
			.catch((err) => console.error('Failed to fetch JSON data:', err));
	}, []);

	function toggleNode(path: string) {
		setExpandedNodes((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(path)) {
				newSet.delete(path);
			} else {
				newSet.add(path);
			}
			return newSet;
		});
	}

	function renderNode(key: string, value: any, path: string) {
		const isExpandable = typeof value === 'object' && value !== null;
		const isOpen = expandedNodes.has(path);
		const displayKey = key || 'root';
		return (
			<div key={path} className='ml-4'>
				<div
					className='
            cursor-pointer 
            select-none 
            mb-1 
            text-sm
          '
					onClick={() => {
						if (isExpandable) toggleNode(path);
					}}>
					{isExpandable && (isOpen ? '▼' : '▶')} {displayKey}
				</div>
				{isExpandable && isOpen && (
					<div className='ml-4'>{Object.entries(value).map(([childKey, childValue]) => renderNode(childKey, childValue, `${path}.${childKey}`))}</div>
				)}
				{!isExpandable && <div className='ml-8 text-xs mb-2'>{String(value)}</div>}
			</div>
		);
	}

	return (
		<div
			className='
        bg-[#1e1e1e]
        text-[#00ff00]
        rounded-md
        p-4
        font-[courier-new,monospace]
        w-[600px]
        mx-auto
        shadow-[0_4px_12px_rgba(0,0,0,0.1)]
      '>
			<div className='flex justify-start pb-2'>
				<div className='w-3 h-3 rounded-full mr-2' style={{ backgroundColor: '#FF605C' }} />
				<div className='w-3 h-3 rounded-full mr-2' style={{ backgroundColor: '#FFBD44' }} />
				<div className='w-3 h-3 rounded-full mr-2' style={{ backgroundColor: '#00CA4E' }} />
			</div>
			<div
				className='
          bg-[#1b1b1b]
          rounded
          p-2
          overflow-y-auto
          max-h-[400px]
        '>
				{jsonData ? renderNode('', jsonData, 'root') : <div className='text-center text-[#d1d5db]'>Loading...</div>}
			</div>
		</div>
	);
}
