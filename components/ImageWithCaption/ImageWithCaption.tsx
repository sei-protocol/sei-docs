import Image, { StaticImageData } from "next/image";
import styles from "./ImageWithCaption.module.css";

interface ImageWithCaption {
  img: StaticImageData;
  alt: string;
  caption?: string;
}

export default function ImageWithCaption({
  img,
  alt,
  caption,
}: ImageWithCaption) {
  return (
    <div className={styles.container}>
      <Image src={img} alt={alt} />
      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  );
}
