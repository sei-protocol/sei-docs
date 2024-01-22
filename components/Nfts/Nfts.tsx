import Image from "next/image";
import styles from "./Nfts.module.css";
import colonyNFT from "./colony.png";
import seiyanNFT from "./seiyan.png";
import { ImageWithCaption } from "../ImageWithCaption";

export default function Nfts() {
  return (
    <div className={styles.container}>
      <div className={styles.image}>
        <ImageWithCaption
          img={colonyNFT}
          alt="Colony NFT"
          caption="Colony NFT"
        />
      </div>
      <div className={styles.image}>
        <ImageWithCaption
          img={seiyanNFT}
          alt="Seiyan NFT"
          caption="Seiyan NFT"
        />
      </div>
    </div>
  );
}
