---
title: 'How Do I Move SEI Between Native (Keplr) and EVM (MetaMask)?'
description: 'How Do I Move SEI Between Native (Keplr) and EVM (MetaMask)?'
---

# How Do I Move SEI Between Native (Keplr) and EVM (MetaMask)?

### **The Problem**

I need to transfer my liquid (non-staked) SEI tokens from my Native address (sei1..., managed by Keplr) to my EVM address (0x..., managed by MetaMask), or vice versa.

### **Solution Steps**

Use the official Sei Bridge:

- Ensure you have **both wallets** installed/accessible (Keplr & MetaMask).

- Ensure both addresses have a **small amount of SEI for gas fees** (Native SEI for Keplr, EVM SEI for MetaMask if bridging _from_ EVM).

- Go to the [Sei Bridge website](https://bridge.sei.io/).

- Click to **Connect** both your Keplr (Native) and MetaMask (EVM) wallets.

- Select **SEI** as the asset to bridge.

- Choose the **Source Chain** (where the tokens _are now_) and **Destination Chain** (where you want them _to go_).

Native to EVM: Source = "Sei", Destination = "Sei (EVM)"

- EVM to Native: Source = "Sei (EVM)", Destination = "Sei"

- Enter the **Amount** to transfer.

- Verify the details and click **Transfer** (or similar button).

- Approve the transaction in your **Source Wallet** (the one you're sending _from_).

- Wait 1-5 minutes for completion.

### **Explanation and Tips**

- **Cause:** Native and EVM environments are separate. The bridge locks tokens on the source and issues corresponding tokens on the destination.

- **Supported Assets:** The bridge primarily supports native SEI but may support other specific tokens. Check the bridge interface for options.

- **Transaction Time:** Can take longer during high network activity.

- **Tokens Not Appearing?**

Verify the source transaction succeeded on its respective explorer ([SeiScan](https://www.seiscan.app/) for Native, [SeiTrace](https://seitrace.com/) for EVM).

- Check the destination address on its explorer for the incoming bridge transaction.

- See [Bridged Assets Not Appearing in Wallet](https://markdowntohtml.com/10-bridged-assets-not-appearing.md).

- **Stuck Transfer?** If pending for hours, check bridge status and potentially contact bridge support. See [Cross-Chain Transfer Stuck for Several Hours.](https://markdowntohtml.com/11-bridge-transfer-stuck.md)
