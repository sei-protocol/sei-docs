---
title: 'How do I stake SEI tokens, and what is the current APR or staking reward?'
description: 'How do I stake SEI tokens, and what is the current APR or staking reward?'
---

# How do I stake SEI tokens, and what is the current APR or staking reward?

To stake SEI tokens and earn staking rewards:

### Staking Process:

**Using Native Wallet**:

- Install a compatible wallet and add Sei Network

- Deposit SEI tokens to your wallet

- Navigate to the "Staking" section in the wallet

- Browse the list of validators and their details

- Select a validator and click "Delegate"

- Enter the amount to stake and confirm

**Using CLI**:

```
# Query validators
seid query staking validators

# Delegate tokens (10 SEI) to a validator
seid tx staking delegate seivaloper1example... 10000000usei \
 --from mykey \
 --chain-id sei-chain-id \
 --gas auto \
 --fees 5000usei

```

**Using Staking Precompile from EVM**:

```
// Staking precompile interface
const stakingContract = new ethers.Contract(
 "0x0000000000000000000000000000000000001007",
 stakingAbi,
 signer
);

// Get list of validators
const validators = await stakingContract.getValidators();

// Delegate tokens
const tx = await stakingContract.delegate(
 validators[0], // First validator in the list
 ethers.utils.parseUnits("10", 6) // 10 SEI (6 decimals in native)
);

```

### Current Staking APR:

The current APR for staking SEI tokens varies based on:

- Total percentage of tokens staked

- Validator commission rates (typically 5-10%)

- Network inflation rate

As of recent data:

- The network-wide staking APR ranges from approximately 5-10%

- This can change based on network parameters and staking participation

To check current APR:

- Visit [Sei Network explorers](https://www.seiscan.app/) or staking dashboards

- Use CLI: `seid query mint inflation`

- Calculate manually:

```
APR ≈ (Inflation Rate / Staked Ratio) * (1 - Community Tax) * (1 - Validator Commission)

```

### Important Considerations:

- **Validator Selection**: Consider reliability, uptime, commission rate, and voting participation

- **Unbonding Period**: Staked SEI has a 21-day unbonding period during which tokens cannot be transferred and do not earn rewards

- **Compounding**: To maximize returns, regularly claim and re-stake rewards

- **Slashing Risk**: If a validator misbehaves, a portion of staked tokens may be slashed (penalized)

For the most current APR information, check Sei Network's official resources or explorers.
