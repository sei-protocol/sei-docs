import React, { useState } from 'react';
import styles from '../../styles/SeiTraceSearch.module.css';

const SeiTraceSearch = () => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const isValidAddress = (addr: string) => {
    // Accept addresses starting with 'sei' or '0x' and of reasonable length
    const seiPattern = /^sei[a-z0-9]{8,}$/i;
    const evmPattern = /^0x[a-fA-F0-9]{40}$/;
    return seiPattern.test(addr) || evmPattern.test(addr);
  };

  const getSeiTraceUrl = (addr: string) => {
    const chainParam = '?chain=pacific-1';
    // For all addresses, use '/address/' path
    return `https://seitrace.com/address/${addr}${chainParam}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAddress = address.trim();
    if (trimmedAddress) {
      if (isValidAddress(trimmedAddress)) {
        const url = getSeiTraceUrl(trimmedAddress);
        window.open(url, '_blank');
        setError('');
      } else {
        setError('Please enter a valid Sei or EVM address.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputContainer}>
        <input
          id="addressInput"
          type="text"
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={`${styles.input} ${error ? styles.error : ''}`}
        />
        <button type="submit" className={styles.button}>
          View on SEITRACE
        </button>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </form>
  );
};

export default SeiTraceSearch;
