// components/EvmWalletConnect/CustomConnectButton.tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styled from 'styled-components';

const CustomButton = styled.button`
	/* --- Light Mode (default) --- */
	background-color: #f9d2d2; /* same light red as LinkCards */
	color: #000;
	border-radius: 0.75rem;
	border: none;
	padding: 0.75rem 1.25rem;
	font-family: 'Inter', sans-serif;
	font-size: 1rem;
	cursor: pointer;
	margin-top: 1rem;
	margin-right: 0.5rem;
	transition:
		background-color 0.3s ease,
		color 0.3s ease;

	&:hover {
		background-color: #e5a8a8; /* same hover color as LinkCards in light mode */
		color: #000;
	}

	/* --- Force Dark Mode (matching .cardLink dark-red) --- */
	/* Adjust if you have .dark on <html> or <body> */
	html.dark &,
	body.dark & {
		background-color: #8b1f1f !important; /* same dark red as LinkCards */
		color: #fff !important;

		&:hover {
			background-color: #9b2f2f !important;
			color: #fff !important;
		}
	}
`;

const CustomConnectButton = () => (
	<ConnectButton.Custom>
		{({ account, chain, openAccountModal, openConnectModal, openChainModal, mounted }) => {
			const ready = mounted;
			const connected = ready && account && chain;

			return (
				<div
					{...(!ready && {
						'aria-hidden': true,
						style: {
							opacity: 0,
							pointerEvents: 'none',
							userSelect: 'none'
						}
					})}>
					{!connected ? (
						<CustomButton onClick={openConnectModal} type='button'>
							Connect Wallet
						</CustomButton>
					) : chain?.unsupported ? (
						<CustomButton onClick={openChainModal} type='button'>
							Wrong network
						</CustomButton>
					) : (
						<CustomButton onClick={openAccountModal} type='button'>
							{account?.displayName}
						</CustomButton>
					)}
				</div>
			);
		}}
	</ConnectButton.Custom>
);

export default CustomConnectButton;
