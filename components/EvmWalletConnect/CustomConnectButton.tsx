import { ConnectButton } from "@rainbow-me/rainbowkit";
import styled from "styled-components";

const WalletSection = styled.div`
  margin: 1.5rem 0;
  background: transparent;
  padding-left: 1rem;
  color: #fff;
`;

const ActionSection = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 0.5rem 0;
`;

const StyledButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(1px);
  }
`;

const NetworkBadge = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.08);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
`;

const CustomConnectButton = () => (
  <WalletSection>
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, openChainModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) return null;

        return (
          <>
            <ActionSection>
              {!connected ? (
                <StyledButton onClick={openConnectModal}>
                  Connect Wallet
                </StyledButton>
              ) : chain?.unsupported ? (
                <StyledButton onClick={openChainModal}>
                  Switch to Sei
                </StyledButton>
              ) : (
                <>
                  <StyledButton onClick={openAccountModal}>
                    {account.displayName}
                  </StyledButton>
                  <NetworkBadge>
                    {chain.name}
                  </NetworkBadge>
                </>
              )}
            </ActionSection>
            {connected && !chain?.unsupported && (
              <WalletInfo>
                <span>Balance: {account.displayBalance}</span>
                •
                <span>
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
              </WalletInfo>
            )}
          </>
        );
      }}
    </ConnectButton.Custom>
  </WalletSection>
);

export default CustomConnectButton;
