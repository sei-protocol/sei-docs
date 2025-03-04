import { ImageWithCaption } from "../ImageWithCaption";
import colonyNFT from "./colony.png";
import seiyanNFT from "./seiyan.png";

export default function Nfts() {
  return (
    <div className="my-4 flex flex-col items-center sm:flex-row justify-center gap-8 w-full">
      <div className="w-full">
        <ImageWithCaption
          img={colonyNFT}
          alt="Colony NFT"
          caption="Colony NFT"
        />
      </div>
      <div className="w-full">
        <ImageWithCaption
          img={seiyanNFT}
          alt="Seiyan NFT"
          caption="Seiyan NFT"
        />
      </div>
    </div>
  );
}
