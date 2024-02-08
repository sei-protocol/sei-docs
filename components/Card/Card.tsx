import Image, { StaticImageData } from "next/image";

import styles from "./Card.module.css";

interface CardProps {
  image: StaticImageData;
  title: string;
  description: string;
  href: string;
}

interface CardsProps {
  children: React.ReactNode;
}

function Card({ image, title, description, href }: CardProps) {
  return (
    <a className={styles.card} href={href} target="_blank" rel="noopener">
      <div className={styles.cardImage}>
        <Image src={image} alt={title} />
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardTitle}>{title}</p>
        <p className={styles.cardDescription}>{description}</p>
      </div>
    </a>
  );
}

function Cards({ children }: CardsProps) {
  return <div className={styles.cards}>{children}</div>;
}

export { Card, Cards };
