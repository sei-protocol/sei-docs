---
title: 'How Do I Convert Between Sei Native and EVM Addresses?'
description: 'How Do I Convert Between Sei Native and EVM Addresses?'
---

# How Do I Convert Between Sei Native and EVM Addresses?

### The Problem

I have a Sei native address (`sei1...`) and need to find its corresponding EVM address (`0x...`), or vice versa, for use in different wallets, explorers, or development tasks.

### Solution Steps

- **Use Block Explorer (Easiest for Users):**

Go to [SeiScan (Native Explorer)](https://www.seiscan.app/pacific-1).

- Search for your **Native (`sei1...`) address**.

- The corresponding **EVM (`0x...`) address** is usually displayed on the address details page. *(Vice-versa lookup on EVM explorers like SeiTrace is less consistently available)*.

- **Use Wallets Supporting Both (e.g., Compass Wallet):**

Import your seed phrase into a wallet that displays both address types (like Compass).

- The wallet interface will typically show both the `sei1...` and `0x...` formats for your account.

- **Use `@sei-js/js` Library (For Developers):**

Install: `npm install @sei-js/js`

- Convert Native to EVM:

```
const { getEvmAddress } = require('@sei-js/js');
const evmAddress = getEvmAddress('YOUR_SEI1_ADDRESS');
console.log(evmAddress);

```

- Convert EVM to Native:

```
const { getSeiAddress } = require('@sei-js/js');
const seiAddress = getSeiAddress('YOUR_0x_ADDRESS');
console.log(seiAddress);

```

### Explanation and Tips

- **⚠️ Important:** Converting address formats does **NOT** move funds between the Native and EVM environments. See Why Don't I See My Tokens After Converting My Address?

- **Consistency:** The conversion is deterministic. A specific `sei1...` address will always map to the same `0x...` address and vice versa, as they derive from the same underlying private key.

- **Finding Your Own Addresses:** If you only have Keplr (Native) and MetaMask (EVM) set up with the *same seed phrase*, you can use the `@sei-js/js` library or SeiScan with your known `sei1...` address to find your linked `0x...` address for MetaMask.

### Related Guides

- Why Don't I See My Tokens After Converting My Address?

- How to Move Tokens Between Native Sei and EVM
