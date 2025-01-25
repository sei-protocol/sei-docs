import React, { useState } from 'react';
import ibcData from './data/ibc_info.json';

export function IbcTokensCard() {
	const [mainOpen, setMainOpen] = useState(false);
	const [expandedChains, setExpandedChains] = useState<string[]>([]);

	function toggleMain() {
		setMainOpen(!mainOpen);
	}

	function toggleChain(name: string) {
		if (expandedChains.includes(name)) {
			setExpandedChains(expandedChains.filter((c) => c !== name));
		} else {
			setExpandedChains([...expandedChains, name]);
		}
	}

	function copyJSON(jsonStr: string) {
		navigator.clipboard.writeText(jsonStr).catch(() => {});
	}

	return (
		<div className='mb-6 rounded border border-white/10 bg-[#141517] overflow-hidden'>
			<button
				className='flex w-full items-center justify-between bg-[#1a1b1e] px-5 py-4 text-base font-medium text-white outline-none hover:bg-white/5'
				onClick={toggleMain}
				onMouseDown={(e) => e.preventDefault()}>
				Chain Details
				<span className={`ml-2 text-[#909296] transition-transform ${mainOpen ? 'rotate-180' : ''}`}>▼</span>
			</button>
			{mainOpen && (
				<div className='px-5 py-4'>
					{Object.entries(ibcData).map(([chainName, channels]) => {
						const arr = channels as any[];
						const isOpen = expandedChains.includes(chainName);
						return (
							<div key={chainName} className='border-t border-white/10 mt-4 pt-4'>
								<button
									className='flex w-full items-center justify-between bg-transparent p-0 text-left text-sm font-semibold text-white outline-none hover:text-white/80'
									onClick={() => toggleChain(chainName)}
									onMouseDown={(e) => e.preventDefault()}>
									{chainName}
									<span className={`ml-2 text-[#909296] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
								</button>
								{isOpen && (
									<div className='ml-4 mt-3'>
										{arr.map((obj, idx) => {
											const jsonStr = JSON.stringify(obj, null, 2);
											return (
												<div key={idx} className='relative mb-4'>
													<button
														className='absolute right-2 top-2 rounded border border-[#2c2e33] bg-black/40 px-2 py-1 text-xs text-white hover:bg-black/70'
														onClick={() => copyJSON(jsonStr)}
														onMouseDown={(e) => e.preventDefault()}>
														Copy
													</button>
													<pre className='mt-0 overflow-auto rounded border border-[#2c2e33] bg-[#25262b] p-3 text-sm text-[#c1c2c5]'>
														<code>{jsonStr}</code>
													</pre>
												</div>
											);
										})}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
