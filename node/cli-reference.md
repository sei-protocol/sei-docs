---
title: CLI Reference
description: Reference documentation for node CLI commands and flags.
---

# CLI Reference

This page documents the available CLI commands and flags for node operations.

---

## `apply`

The `apply` command deploys or updates a node configuration based on a given preset and options.

### Synopsis

```bash
apply --preset <preset-name> [flags]
```

### Flags

#### `--preset`

Specifies the deployment preset to use. For example:

- `genesis-chain` — deploys a node as part of a new chain with a custom genesis.
- `rpc` — deploys a standard RPC node.

```bash
apply --preset genesis-chain
```

---

#### `--genesis-override`

Sets a key in `spec.genesis.overrides` to customize genesis parameters when deploying with the `genesis-chain` preset.

**Syntax:**

```bash
--genesis-override <module>.<field>[.<field>...]=<value>
```

**Examples:**

```bash
# Set the staking unbonding time to 600 seconds
apply --preset genesis-chain --genesis-override staking.params.unbonding_time=600s

# Set the governance voting period
apply --preset genesis-chain --genesis-override gov.params.voting_period=172800s

# Pass multiple overrides
apply --preset genesis-chain \
  --genesis-override staking.params.unbonding_time=600s \
  --genesis-override gov.params.voting_period=172800s
```

**Value parsing:**

Values are parsed in the following order:

1. **JSON-compatible types** — numbers, booleans, and JSON objects are parsed as their native JSON types.
2. **Strings** — any value that cannot be parsed as JSON is stored as a plain string (e.g., `600s`).

| Example value | Stored type |
|---|---|
| `42` | number |
| `true` | boolean |
| `{"key":"val"}` | object |
| `600s` | string |

**Restrictions and validation:**

- **`--preset genesis-chain` is required.** Using `--genesis-override` with any other preset (e.g., `rpc`) returns a validation error:
  ```
  only valid with --preset genesis-chain
  ```

- **Keys must have at least two dot-separated segments** in the form `module.field[.field...]`. Single-segment keys (e.g., `staking=value`) are rejected with a validation error.

- **Empty keys, empty values, and empty path segments are not allowed.** All of the following are invalid:
  - `--genesis-override =value` (empty key)
  - `--genesis-override staking.params.=value` (empty path segment)
  - `--genesis-override staking.params.unbonding_time=` (empty value)

- The flag is **repeatable** — pass it multiple times to set multiple genesis overrides.
