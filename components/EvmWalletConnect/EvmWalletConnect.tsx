'use client';

import React from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Box, Button } from '@radix-ui/themes';
import { IconLogout } from '@tabler/icons-react';
import useSeiAddress from '../../hooks/useSeiAddress';
import { getCosmosChainId } from '../../utils/chains';
import { CopyText } from '../CopyText';
import { SwitchNetwork } from '../SwitchNetwork';

export default function EvmWalletConnect() {
	const { handleLogOut, network, primaryWallet, setShowAuthFlow } = useDynamicContext();

	const response = useSeiAddress({ chainId: getCosmosChainId(Number(network)) });
	const { data: seiAddress, isLoading } = response;

	const renderContent = () => {
		if (network) {
			return (
				<Button className='flex flex-row gap-4 !bg-neutral-700 !p-6 !rounded-2xl cursor-pointer hover:!bg-[#9e1f19aa]' onClick={handleLogOut}>
					<IconLogout />
					<p className='font-bold'>Disconnect Wallet</p>
				</Button>
			);
		}

		return (
			<Button onClick={() => setShowAuthFlow(true)} className='flex flex-row gap-4 !bg-[#9e1f19] !p-6 !rounded-2xl cursor-pointer hover:!bg-[#9e1f19aa]'>
				<p className='font-bold'>Connect & Link Wallet</p>
			</Button>
		);
	};

	if (!network) {
		return <Box className='w-full mt-4'>{renderContent()}</Box>;
	}

	return (
		<div className='flex flex-col gap-4 mt-4 border-2 border-neutral-200 dark:border-neutral-800 border-1 p-4 rounded-xl'>
			<SwitchNetwork />
			<div className='flex flex-col gap-2'>
				<CopyText
					column={true}
					label='EVM Address:'
					value={primaryWallet?.address && !isLoading ? primaryWallet?.address : '---'}
					copyDisabled={network === undefined}
				/>
				<CopyText column={true} label='Cosmos Address:' value={seiAddress && !isLoading ? seiAddress : '---'} copyDisabled={network === undefined || isLoading} />
				<Box className='w-full mt-4'>{renderContent()}</Box>
			</div>
		</div>
	);
}
