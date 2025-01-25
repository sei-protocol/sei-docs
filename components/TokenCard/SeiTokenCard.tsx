import React, { useState, FC } from 'react';

const WEI_PER_SEI = 1e18;
const MICROSEI_PER_SEI = 1e6;

interface SeiTokenCardProps {
	tooltip?: string;
}

export const SeiTokenCard: FC<SeiTokenCardProps> = ({ tooltip }) => {
	const [seiAmount, setSeiAmount] = useState('');
	const numericSei = parseFloat(seiAmount) || 0;
	const weiValue = numericSei * WEI_PER_SEI;
	const cosmosValue = numericSei * MICROSEI_PER_SEI;

	return (
		<div className='mb-6 rounded border border-white/10 bg-[#141517] p-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<h2 className='text-xl font-semibold text-white m-0'>Sei Token</h2>
					{tooltip && (
						<span className='cursor-pointer rounded-full bg-[#25262b] px-2 text-sm text-[#909296]' title={tooltip}>
							?
						</span>
					)}
				</div>
			</div>
			<p className='mt-2 text-[#c1c2c5]'>Convert SEI to Wei (EVM) or microSEI (Cosmos) by entering an amount.</p>
			<div className='mt-4'>
				<label className='mb-1 block text-sm text-[#909296]'>SEI Amount → Wei</label>
				<input
					className='mb-2 w-full rounded border border-[#2c2e33] bg-[#1a1b1e] p-2 text-sm text-[#c1c2c5]'
					type='number'
					placeholder='Enter SEI amount'
					value={seiAmount}
					onChange={(e) => setSeiAmount(e.target.value)}
				/>
				<div className='text-sm text-[#c1c2c5]'>{weiValue.toLocaleString('en-US')} wei</div>
			</div>
			<div className='mt-4'>
				<label className='mb-1 block text-sm text-[#909296]'>SEI Amount → microSEI</label>
				<input
					className='mb-2 w-full rounded border border-[#2c2e33] bg-[#1a1b1e] p-2 text-sm text-[#c1c2c5]'
					type='number'
					placeholder='Enter SEI amount'
					value={seiAmount}
					onChange={(e) => setSeiAmount(e.target.value)}
				/>
				<div className='text-sm text-[#c1c2c5]'>{cosmosValue.toLocaleString('en-US')} microSEI</div>
			</div>
		</div>
	);
};
