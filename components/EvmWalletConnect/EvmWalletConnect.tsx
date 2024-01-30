import {
  ConnectButton,
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { injectedWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { Chain, configureChains, createConfig, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import styles from "./EvmWalletConnect.module.css";
import "@rainbow-me/rainbowkit/styles.css";

export default function EvmWalletConnect() {
  const seiDevnet: Chain = {
    id: 713715,
    name: "Sei EVM Devnet",
    network: "sei",
    nativeCurrency: {
      decimals: 18,
      name: "Sei",
      symbol: "SEI",
    },
    rpcUrls: {
      public: { http: ["https://evm-rpc.arctic-1.seinetwork.io/"] },
      default: { http: ["https://evm-rpc.arctic-1.seinetwork.io/"] },
    },
  };

  const { chains, publicClient } = configureChains(
    [seiDevnet],
    [publicProvider()]
  );

  const projectId = "385413c214cb74213e0679bc30dd4e4c";
  const connectors = connectorsForWallets([
    {
      groupName: "Recommended",
      wallets: [
        injectedWallet({ chains }),
        metaMaskWallet({ projectId, chains }),
      ],
    },
  ]);

  const wagmiConfig = createConfig({
    autoConnect: false,
    connectors,
    publicClient,
  });

  return (
    <div className={styles.container}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <ConnectButton showBalance={false} />
        </RainbowKitProvider>
      </WagmiConfig>
    </div>
  );
}
