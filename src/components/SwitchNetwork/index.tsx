'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { SegmentedControl } from '@radix-ui/themes';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { getChainIdHexForNetwork, NetworkType } from '../../utils/chains';

type SwitchNetworkProps = {};

export const selectedNetworkAtom = atom<NetworkType>('mainnet');

export const SwitchNetwork = ({}: SwitchNetworkProps) => {
	const { primaryWallet, network } = useDynamicContext();

	const [selectedNetwork, setSelectedNetwork] = useAtom(selectedNetworkAtom);

	useEffect(() => {
		const autoSwitchNetwork = async () => {
			await primaryWallet?.switchNetwork(getChainIdHexForNetwork(selectedNetwork));
		};
		if (network && selectedNetwork !== network) {
			autoSwitchNetwork().then();
		}
	}, [selectedNetwork, network]);

	const onClickSwitch = async (networkType: NetworkType) => {
		setSelectedNetwork(networkType);

		if (!primaryWallet) return;

		await primaryWallet?.switchNetwork(getChainIdHexForNetwork(networkType));
	};

	return (
		<SegmentedControl.Root defaultValue='mainnet' value={selectedNetwork} size='3' className='w-fit'>
			<SegmentedControl.Item value='mainnet' onClick={() => onClickSwitch('mainnet')}>
				Mainnet
			</SegmentedControl.Item>
			<SegmentedControl.Item value='testnet' onClick={() => onClickSwitch('testnet')}>
				Testnet
			</SegmentedControl.Item>
		</SegmentedControl.Root>
	);
};
