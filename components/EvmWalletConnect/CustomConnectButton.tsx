// components/EvmWalletConnect/CustomConnectButton.tsx
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styled from 'styled-components';

const CustomButton = styled.button`
background: #001B2A; /* Dark color */
border: none;
color: #ECDEDE; /* Light color */
padding: 0.5rem 1rem;
font-size: 1rem;
cursor: pointer;
transition: color 0.3s, background 0.3s;
display: inline-block;
margin-top: 1rem;
margin-right: 0.5rem;
border-radius: 25px; /* Rounded corners */
text-align: center;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
font-family: 'Inter', sans-serif;

&:hover {
color: #001B2A; /* Dark color */
background: #ECDEDE; /* Light color */
}
`;

const CustomConnectButton = (props) => (
<ConnectButton.Custom>
{({ account, chain, openAccountModal, openConnectModal, openChainModal, mounted }) => {
    const ready = mounted;
    const connected = ready && account && chain;

    return (
    <div
        {...(!ready && {
        'aria-hidden': true,
        'style': {
            opacity: 0,
            pointerEvents: 'none',
            userSelect: 'none'
        },
        })}
    >
        {(() => {
        if (!connected) {
            return (
            <CustomButton onClick={openConnectModal} type="button">
                Connect Wallet
            </CustomButton>
            );
        }

        if (chain.unsupported) {
            return (
            <CustomButton onClick={openChainModal} type="button">
                Wrong network
            </CustomButton>
            );
        }

        return (
            <CustomButton onClick={openAccountModal} type="button">
            {account.displayName}
            </CustomButton>
        );
        })()}
    </div>
    );
}}
</ConnectButton.Custom>
);

export default CustomConnectButton;
