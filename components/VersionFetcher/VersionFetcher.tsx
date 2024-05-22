import React, { useEffect } from 'react';

interface VersionFetcherProps {
  chainId: string;
  rpcEndpoint: string;
  setVersion: (version: string) => void;
}

const VersionFetcher: React.FC<VersionFetcherProps> = ({ chainId, rpcEndpoint, setVersion }) => {
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch(`${rpcEndpoint}/abci_info`);
        const data = await response.json();
        const version = data.response.version;
        setVersion(version);
        localStorage.setItem(`${chainId}-version`, version);
        localStorage.setItem(`${chainId}-version-timestamp`, Date.now().toString());
      } catch (error) {
        console.error('Error fetching version:', error);
      }
    };

    const storedVersion = localStorage.getItem(`${chainId}-version`);
    const storedTimestamp = localStorage.getItem(`${chainId}-version-timestamp`);
    const oneHour = 3600000;

    if (storedVersion && storedTimestamp && Date.now() - parseInt(storedTimestamp, 10) < oneHour) {
      setVersion(storedVersion);
    } else {
      fetchVersion();
    }
  }, [chainId, rpcEndpoint, setVersion]);

  return null;
};

export default VersionFetcher;
