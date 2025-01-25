import React, { useState } from 'react';

interface GuideStep {
	text?: string;
	command?: string;
}

interface TokenCardProps {
	title: string;
	steps?: GuideStep[];
}

export function TokenCard({ title, steps = [] }: TokenCardProps) {
	const [open, setOpen] = useState(false);

	function toggle() {
		setOpen(!open);
	}

	function copyCommand(cmd: string) {
		navigator.clipboard.writeText(cmd).catch(() => {});
	}

	return (
		<div className='mb-6 rounded border border-white/10 bg-[#141517] overflow-hidden'>
			<button
				className='flex w-full items-center justify-between border-none bg-[#1a1b1e] px-5 py-4 text-left text-base font-medium text-white outline-none hover:bg-white/5'
				onClick={toggle}
				onMouseDown={(e) => e.preventDefault()}>
				{title}
				<span className={`ml-2 text-[#909296] transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
			</button>
			{open && (
				<div className='p-4'>
					{steps.map((step, i) => (
						<div key={i} className='mb-4'>
							{step.text && <p className='mb-2 text-sm text-[#c1c2c5]'>{step.text}</p>}
							{step.command && (
								<div className='relative'>
									<button
										className='absolute right-2 top-2 rounded border border-[#2c2e33] bg-black/40 px-2 py-1 text-xs text-white hover:bg-black/70'
										onClick={() => copyCommand(step.command!)}
										onMouseDown={(e) => e.preventDefault()}>
										Copy
									</button>
									<pre className='mt-0 overflow-auto rounded border border-[#2c2e33] bg-[#25262b] p-3 text-sm text-[#c1c2c5]'>
										<code>{step.command}</code>
									</pre>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
