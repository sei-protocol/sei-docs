import { StaticImageData } from "next/image";
import { Card, Cards } from "../../components";

import camelLogo from "../../public/assets/ecosystem/camel.png";
import gamblinoLogo from "../../public/assets/ecosystem/gamblino.jpeg";
import dragonswapLogo from "../../public/assets/ecosystem/dragonswap.jpeg";
import fluidLogo from "../../public/assets/ecosystem/fluid.png";
import belugasLogo from "../../public/assets/ecosystem/belugas.png";
import squaredLabsLogo from "../../public/assets/ecosystem/squared-labs.jpeg";
import seijinLogo from "../../public/assets/ecosystem/seijin.png";
import predxLogo from "../../public/assets/ecosystem/predx.jpeg";
import yakaLogo from "../../public/assets/ecosystem/yaka.jpeg";
import webumpLogo from "../../public/assets/ecosystem/webump.jpeg";
import accumulatedLogo from "../../public/assets/ecosystem/accumulated.jpeg";
import mambaLogo from "../../public/assets/ecosystem/mamba.png";
import jellyverseLogo from "../../public/assets/ecosystem/jellyverse.png";
import seicasinoLogo from "../../public/assets/ecosystem/seicasino.png";
import hoyuLogo from "../../public/assets/ecosystem/hoyu.jpeg";
import superSeiyanBotLogo from "../../public/assets/ecosystem/superseiyanbot.jpeg";
import nfts2meLogo from "../../public/assets/ecosystem/nfts2me.png";
import stafiLogo from "../../public/assets/ecosystem/stafi.png";

interface App {
  title: string;
  description: string;
  href: string;
  image: StaticImageData;
}

const APPS: App[] = [
  {
    title: "DragonSwap",
    description: "The native DEX on SEI",
    href: "https://test.dragonswap.app/",
    image: dragonswapLogo,
  },
  {
    title: "SeiCasino",
    description: "Full-featured casino built natively on Sei",
    href: "https://seicasino.io",
    image: seicasinoLogo,
  },
  {
    title: "WeBump",
    description: "Sei native NFT launchpad",
    href: "https://webump.xyz/",
    image: webumpLogo,
  },
  {
    title: "Seijin",
    description: "Launchpad on Sei",
    href: "https://seijin.app/staking",
    image: seijinLogo,
  },
  {
    title: "Squared Labs",
    description: "Quadratic price exposure on perpetual futures",
    href: "https://squaredlabs.io/app/btc",
    image: squaredLabsLogo,
  },
  {
    title: "PredX",
    description: "Prediction market",
    href: "https://events.predx.ai/",
    image: predxLogo,
  },
  {
    title: "Gamblino",
    description:
      "GambleFi protocol covering crypto, sportsbook and classic games of chance",
    href: "https://test.gamblino.app/",
    image: gamblinoLogo,
  },
  {
    title: "Camel",
    description: "Sei's liquidity oasis",
    href: "https://camel.money",
    image: camelLogo,
  },
  {
    title: "Fluid",
    description: "Interest free loans, backed by Sei",
    href: "https://thefluid.xyz/",
    image: fluidLogo,
  },
  {
    title: "Belugas",
    description: "Decentralized marketplace for lenders and borrowers",
    href: "https://www.belugas.io/",
    image: belugasLogo,
  },
  {
    title: "Yaka",
    description: "Algebra Integral fork on Sei",
    href: "https://test.yaka.finance/",
    image: yakaLogo,
  },
  {
    title: "Accumulated",
    description: "Liquid staking protocol",
    href: "https://testnet.accumulated.finance/stake/sei",
    image: accumulatedLogo,
  },
  {
    title: "Mamba Defi",
    description: "Defi and memecoin ecosystem",
    href: "https://www.mambaswap.io/",
    image: mambaLogo,
  },
  {
    title: "JellyVerse",
    description: "Smart order router",
    href: "https://jelly-verse-sei.vercel.app/jellyswap",
    image: jellyverseLogo,
  },
  {
    title: "Hoyu",
    description:
      "DeFi protocol uniting lending and trading markets to give every token new utility as safe collateral",
    href: "https://arctic.hoyu.io",
    image: hoyuLogo,
  },
  {
    title: "Super Seiyan Bot",
    description: "Sei native telegram trading bot",
    href: "https://t.me/SSeiyanEvmBot",
    image: superSeiyanBotLogo,
  },
  {
    title: "NFTs2ME",
    description: "No-code NFT creation tool",
    href: "https://nfts2me.com/app/sei-devnet/",
    image: nfts2meLogo,
  },
  {
    title: "Stafi",
    description: "LST protocol",
    href: "https://test-app.stafi.io/gallery/evm/SEI/?net=SEI",
    image: stafiLogo,
  },
];

const EcosystemApps = () => {
  return (
    <Cards>
      {APPS.map((app) => (
        <Card
          key={app.title}
          title={app.title}
          description={app.description}
          href={app.href}
          image={app.image}
        />
      ))}
    </Cards>
  );
};

export default EcosystemApps;
