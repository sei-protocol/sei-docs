---
title: 'How can my EVM smart contract get on-chain price information for tokens?'
description: 'How can my EVM smart contract get on-chain price information for tokens?'
---

# How can my EVM smart contract get on-chain price information for tokens?

# Using the Oracle Precompile (`0x...1008`)

Sei provides an **Oracle Precompile** at address `0x0000000000000000000000000000000000001008` that allows EVM contracts to read price data directly from Sei's native oracle module. This is crucial for DeFi applications needing reliable price feeds.

**Key Functions (Solidity Interface):**

```
interface ISeiOraclePrecompile {
 // --- Return Struct Definitions ---
 struct OracleExchangeRate {
 string ExchangeRate; // The exchange rate, represented as a string decimal.
 string LastUpdate; // Timestamp of the last successful update (as string).
 int64 LastUpdateTimestamp; // Timestamp of the last successful update (as int64 epoch seconds).
 }

 struct DenomOracleExchangeRatePair {
 string Denom; // The denomination string (e.g., "usei", "uatom").
 OracleExchangeRate OracleExchangeRateVal; // The rate details.
 }

 struct OracleTwap {
 string Denom; // The denomination string.
 string Twap; // The time-weighted average price (as string decimal).
 int64 LookbackSeconds; // The lookback period used for calculation.
 }

 // --- View Functions ---

 /**
 * @notice Gets the latest exchange rates for all tracked denominations.
 * @return rates An array of structs containing denom and rate information.
 */
 function getExchangeRates() external view returns (DenomOracleExchangeRatePair[] memory rates);

 /**
 * @notice Calculates and returns Time-Weighted Average Prices (TWAPs) for all tracked denominations.
 * @param lookbackSeconds The duration (in seconds) over which to calculate the TWAP.
 * @return twaps An array of structs containing denom and TWAP information.
 */
 function getOracleTwaps(uint64 lookbackSeconds) external view returns (OracleTwap[] memory twaps);
}

```

**How to Use:**

- **Interface:** Define or import the `ISeiOraclePrecompile` interface in your contract.

- **Instantiate:** Get a reference: `ISeiOraclePrecompile constant seiOracle = ISeiOraclePrecompile(0x0000000000000000000000000000000000001008);`

- **Call Functions:** Invoke `getExchangeRates()` or `getOracleTwaps(lookback_seconds)`.

**Important Considerations:**

- **String Decimal Prices:** The most critical point is that `ExchangeRate` and `Twap` values are returned as **strings**, not `uint256`. These strings represent potentially high-precision decimal numbers.

**Handling in Solidity:** You **cannot** directly cast these strings to `uint256` or use them in standard arithmetic operations if they contain decimals. You must either:

Use a Solidity library designed for handling decimal strings or fixed-point arithmetic (e.g., ABDKMath64x64, PRBMath) to parse the string and convert it into a usable fixed-point representation.

- Pass the string price off-chain for processing.

- **Read-Only:** Both functions are view functions (read-only) and are non-payable (`msg.value` must be 0).

- **Gas:** Gas costs are relatively low, primarily for reading oracle state.

- **Available Denoms:** The functions return data for all denominations currently tracked by the Sei oracle module.

**Example Usage (Conceptual - requires parsing library):**

```
// Assume FixedPoint library exists for string decimal parsing
import { FixedPoint } from "./FixedPoint.sol";

contract OracleUser {
 ISeiOraclePrecompile constant seiOracle = ISeiOraclePrecompile(0x...);

 function checkSeiPriceAgainstThreshold(string memory priceThreshold) public view {
 ISeiOraclePrecompile.DenomOracleExchangeRatePair[] memory rates = seiOracle.getExchangeRates();
 string memory currentPriceStr;
 for (uint i = 0; i length; i++) {
 if (keccak256(abi.encodePacked(rates[i].Denom)) == keccak256(abi.encodePacked("usei"))) { // Assuming "usei" price vs reference
 currentPriceStr = rates[i].OracleExchangeRateVal.ExchangeRate;
 break;
 }
 }
 require(bytes(currentPriceStr).length > 0, "Price not found");

 int256 currentPrice = FixedPoint.parseDecimal(currentPriceStr);
 int256 thresholdPrice = FixedPoint.parseDecimal(priceThreshold);

 require(currentPrice >= thresholdPrice, "Price is below threshold");
 }
}

```
