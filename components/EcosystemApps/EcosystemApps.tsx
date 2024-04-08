import { Card, Cards } from "../../components";

import camelLogo from "../../public/assets/ecosystem/camel.png";
import gamblinoLogo from "../../public/assets/ecosystem/gamblino.jpeg";
import dragonswapLogo from "../../public/assets/ecosystem/dragonswap.jpeg";
import fluidLogo from "../../public/assets/ecosystem/fluid.png";
import belugasLogo from "../../public/assets/ecosystem/belugas.png";
import squaredLabsLogo from "../../public/assets/ecosystem/squared-labs.jpeg";
import seijinLogo from "../../public/assets/ecosystem/seijin.png";
import metamaskLogo from "../../public/assets/ecosystem/metamask.jpeg";
import compassLogo from "../../public/assets/ecosystem/compass.jpeg";
import finLogo from "../../public/assets/ecosystem/fin.jpeg";
import { StaticImageData } from "next/image";

interface App {
  title: string;
  description: string;
  href: string;
  image: StaticImageData;
}

const APPS: App[] = [
  {
    title: "Camel",
    description: "Sei's liquidity oasis",
    href: "https://camel.money",
    image: camelLogo,
  },
  {
    title: "Gamblino",
    description:
      "GambleFi protocol covering crypto, sportsbook and classic games of chance",
    href: "https://test.gamblino.app/",
    image: gamblinoLogo,
  },
  {
    title: "DragonSwap",
    description: "The native DEX on SEI",
    href: "https://test.dragonswap.app/",
    image: dragonswapLogo,
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
    title: "Squared Labs",
    description: "Quadratic price exposure on perpetual futures",
    href: "https://squaredlabs.io/app/btc",
    image: squaredLabsLogo,
  },
  {
    title: "Seijin",
    description: "Launchpad on Sei",
    href: "https://seijin.app/staking",
    image: seijinLogo,
  },
  {
    title: "MetaMask",
    description: "EVM wallet",
    href: "https://metamask.io/",
    image: metamaskLogo,
  },
  {
    title: "Compass",
    description: "Sei native wallet",
    href: "https://compasswallet.io/",
    image: compassLogo,
  },
  {
    title: "Fin",
    description: "Sei native wallet",
    href: "https://finwallet.com/",
    image: finLogo,
  },
];

APPS.sort((a, b) => a.title.localeCompare(b.title));

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
