---
title: 'What Can I Do If My Sei Transaction is Stuck Pending?'
description: 'What Can I Do If My Sei Transaction is Stuck Pending?'
---

# What Can I Do If My Sei Transaction is Stuck Pending?

### The Problem

I sent a transaction using MetaMask (EVM) or Keplr (Native) on Sei, but it's been stuck in a "Pending" state for a long time and isn't confirming.

### Solution Steps

- **Check Explorer:** Get the Transaction Hash (TxID) from your wallet history.

For EVM tx: Check [SeiTrace](https://seitrace.com/).

- For Native tx: Check [SeiScan](https://www.seiscan.app/).

- *Status Found?* If Failed, note the error and retry. If Success, the issue is elsewhere. If still Pending or Not Found, proceed below.

- **MetaMask (EVM):**

Go to the **Activity** tab.

- Find the pending transaction.

- Try **"Speed Up"** (resubmit with higher gas price - costs more).

- If Speed Up fails or isn't desired, try **"Cancel"** (sends a 0 SEI tx with the same nonce - costs gas).

- *Last Resort:* Settings > Advanced > **Reset Account** (clears local tx history/nonce, doesn't affect funds). Retry the original transaction after resetting.

- **Keplr (Native):**

Native transactions usually confirm/fail quickly. Wait at least 5 minutes.

- If still not confirmed on [SeiScan](https://www.seiscan.app/), it likely never reached the network.

- **Retry the transaction** ensuring you have enough native SEI for gas.

### Explanation & Tips

- **Possible Causes:** Network congestion, low gas price (EVM), incorrect nonce (EVM), RPC node issues.

- **Nonce Issues (EVM):** Transactions *must* process in order. If an earlier transaction (nonce 5) is stuck, the next (nonce 6) won't confirm until 5 does. Speeding up or cancelling the *earliest* stuck transaction is key.

- **Gas Price vs. Gas Limit (EVM):** "Speed Up" increases the *gas price* (priority). If the transaction fails with "Out of Gas", you need to increase the *gas limit*.

- **Network/RPC Check:** Check [Sei Discord](https://discord.gg/sei) for network status. Try switching RPC endpoints in your wallet settings if problems persist.
