// components/BrandKitGallery/DownloadButton.tsx
import React from 'react';
import styles from '../../styles/custom.module.css';

const DownloadButton = ({ url, fileName, children }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button className={styles.downloadButton} onClick={handleDownload}>
      {children}
    </button>
  );
};

export default DownloadButton;
