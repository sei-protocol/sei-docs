# Node Configuration

This page documents configuration options for the `apply` subcommand used to deploy and configure nodes.

<!-- TODO: expand with full apply subcommand reference -->

## `apply` subcommand

The `apply` subcommand provisions a node using a specified preset and configuration flags.

### Presets

Use `--preset` to select the node profile. Available presets include:

- `genesis-chain` — deploy a genesis node with full chain initialization
- `rpc` — deploy an RPC node

<!-- TODO: expand preset list -->

---

## Genesis Overrides (`--genesis-override`)

When deploying a node with `--preset genesis-chain`, you can use the `--genesis-override` flag to set individual genesis parameters without modifying a full genesis file.

Each override targets a dotted path within `spec.genesis.overrides`, following the structure `<module>.<field>[.<subfield>...]`.

### Syntax

```
--genesis-override <module.field[.field...]>=<value>
```

The key must contain **at least two segments** (a module name and at least one field). Single-segment keys are not accepted.

The flag is **repeatable** — you can supply multiple overrides in a single command:

```bash
appy apply \
  --preset genesis-chain \
  --genesis-override staking.params.unbonding_time=600s \
  --genesis-override gov.params.voting_period=120s
```

### Value parsing

Values are parsed as JSON where possible:

| Input | Stored as |
|---|---|
| `42` | number |
| `true` / `false` | boolean |
| `{"key":"val"}` | object |
| `600s` | string (not valid JSON) |

If the value cannot be parsed as valid JSON, it is stored as a plain string.

To force a numeric-looking value to be stored as a string, wrap it in JSON quotes:

```bash
--genesis-override staking.params.some_field='"42"'
```

### Example

Set the staking unbonding time and the governance voting period when deploying a genesis chain node:

```bash
appy apply \
  --preset genesis-chain \
  --genesis-override staking.params.unbonding_time=600s \
  --genesis-override gov.params.voting_period=86400s
```

### Restriction

`--genesis-override` is **only valid with `--preset genesis-chain`**. Using it with any other preset (such as `rpc`) will produce a validation error:

```
error: --genesis-override is only valid with --preset genesis-chain
```
