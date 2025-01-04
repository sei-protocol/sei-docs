import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { injectedWallet, metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import '@rainbow-me/rainbowkit/styles.css';
import CustomConnectButton from './CustomConnectButton';

export default function EvmWalletConnect() {
  const sei = {
    id: 1329,
    name: 'Sei Network',
    network: 'sei',
    nativeCurrency: {
      decimals: 18,
      name: 'Sei',
      symbol: 'SEI',
    },
    rpcUrls: {
      public: { http: ['https://evm-rpc.sei-apis.com'] },
      default: { http: ['https://evm-rpc.sei-apis.com'] },
    },
    testnet: true,
    blockExplorers: {
      default: { name: 'Seitrace', url: 'https://seitrace.com' },
    },
  };

  // Configure chains and providers
  const { chains, publicClient } = configureChains([sei], [publicProvider()]);

  const projectId = '385413c214cb74213e0679bc30dd4e4c';

  // Configure wallet connectors
  const connectors = connectorsForWallets([
    {
      groupName: 'Recommended',
      wallets: [
        injectedWallet({ chains }),
        metaMaskWallet({ projectId, chains }),
        walletConnectWallet({ projectId, chains }),
      ],
    },
  ]);

  // Create the Wagmi config
  const config = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  });

  return (
    <div className="my-4 flex justify-center">
      <WagmiConfig config={config}>
        <RainbowKitProvider chains={chains}>
          <CustomConnectButton />
        </RainbowKitProvider>
      </WagmiConfig>
    </div>
  );
}
