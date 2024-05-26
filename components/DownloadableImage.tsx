// components/DownloadableImage.tsx
import NextImage from 'next/image';
import styles from '../styles/DownloadableImage.module.css';
import { useState, useEffect } from 'react';

interface DownloadableImageProps {
url: string;
alt: string;
name: string;
downloadable?: boolean;
}

const DownloadableImage = ({ url, alt, name, downloadable = true }: DownloadableImageProps) => {
const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
const [showModal, setShowModal] = useState(false);

useEffect(() => {
const img = new window.Image();
img.src = url;
img.onload = () => {
    setImageDimensions({ width: img.width, height: img.height });
};
}, [url]);

const handleImageClick = (e: React.MouseEvent) => {
if (downloadable) {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
} else {
    setShowModal(true);
    document.body.style.overflow = 'hidden';
}
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
    {downloadable && (
        <a href={url} download={name} className={styles.downloadButton} onClick={handleImageClick}>
        <i className="fas fa-download"></i>
        </a>
    )}
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

export default DownloadableImage;
