// components/SeiTraceSearch.tsx

import React, { useState } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  margin-top: 1rem;
`;

const Label = styled.label`
  color: #ddd;
  font-size: 1rem;
`;

const InputContainer = styled.div`
  display: flex;
  margin-top: 0.5rem;
`;

const Input = styled.input<{ hasError: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 25px 0 0 25px;
  background-color: #1a1a1a;
  color: #fff;
  outline: none;
  transition: background-color 0.3s;

  ::placeholder {
    color: #666;
  }

  ${({ hasError }) =>
    hasError
      ? `
    background-color: #2a1a1a;
    box-shadow: inset 0 0 0 2px #e74c3c;
  `
      : `
    box-shadow: inset 0 0 0 2px #333;
  `}
`;

const Button = styled.button`
  padding: 0 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0 25px 25px 0;
  background-color: #1a1a1a;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
  box-shadow: inset 0 0 0 2px #333;

  &:hover {
    background-color: #333;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

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
    <Form onSubmit={handleSubmit}>
      <InputContainer>
        <Input
          id="addressInput"
          type="text"
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          hasError={!!error}
        />
        <Button type="submit">View on Sei Trace</Button>
      </InputContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Form>
  );
};

export default SeiTraceSearch;
