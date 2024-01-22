import Image from "next/image";
import styles from "./Nfts.module.css";
import colonyNFT from "./colony.png";
import seiyanNFT from "./seiyan.png";

export default function Nfts() {
  return (
    <div className={styles.container}>
      <div className={styles.image}>
        <Image src={colonyNFT} alt="Colony NFT" width={300} height={300} />
        <p>Colony NFT</p>
      </div>
      <div className={styles.image}>
        <Image src={seiyanNFT} alt="Seiyan NFT" width={300} height={300} />
        <p>Seiyan NFT</p>
      </div>
    </div>
  );
}
