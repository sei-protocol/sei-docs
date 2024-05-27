// components/BrandKitGallery/BrandImage.tsx
import NextImage from 'next/image';
import styles from '../../styles/custom.module.css';
import { useState, useEffect } from 'react';

interface BrandImageProps {
  url: string;
  alt: string;
  name: string;
}

const BrandImage = ({ url, alt, name }: BrandImageProps) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
  }, [url]);

  const handleImageClick = () => {
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <div className={styles.imageWrapper}>
        <div className={styles.imageContainer}>
          <NextImage
            src={url}
            alt={alt}
            width={imageDimensions.width}
            height={imageDimensions.height}
            className={styles.image}
            onClick={handleImageClick}
          />
        </div>
      </div>
      {showModal && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent}>
            <NextImage src={url} alt={alt} layout="fill" objectFit="contain" />
          </div>
        </div>
      )}
    </>
  );
};

export default BrandImage;
