# Node Configuration

This page describes configuration options for deploying and managing nodes.

## The `apply` subcommand

The `apply` subcommand deploys or updates a node according to the specified configuration flags.

```
apply [flags]
```

### Flags

| Flag | Type | Description |
|------|------|-------------|
| `--preset` | string | The deployment preset to use (e.g. `genesis-chain`). |
| `--genesis-override` | string slice | Set genesis module parameters. Only valid with `--preset genesis-chain`. Repeatable. |

---

## `--genesis-override`

The `--genesis-override` flag allows you to set individual genesis module parameters when deploying a node with the `genesis-chain` preset.

### Syntax

```
--genesis-override <module.field[.field...]>=<value>
```

The key must be a dotted cosmos-module path that identifies the parameter to override, starting with the module name followed by one or more field names:

```
<module>.<field>[.<field>...]
```

The flag is repeatable — pass it multiple times to override several parameters:

```bash
apply \
  --preset genesis-chain \
  --genesis-override staking.params.unbonding_time=600s \
  --genesis-override gov.params.voting_period=120s
```

### Value parsing

Values are parsed using a **JSON-first** strategy:

- If the value is valid JSON (a number, boolean, object, or array), it is stored as the corresponding JSON type.
- If the value is not valid JSON, it is stored as a raw string.

Examples:

| Raw value | Parsed as |
|-----------|-----------|
| `true` | JSON boolean |
| `42` | JSON number |
| `600s` | string (not valid JSON) |
| `{"key":"val"}` | JSON object |

To force a value that looks like a valid JSON number or boolean to be treated as a string, wrap it in JSON quotes:

```bash
--genesis-override foo.bar='"42"'
```

### Constraint: requires `--preset genesis-chain`

`--genesis-override` is only valid when `--preset genesis-chain` is also specified. Using it with any other preset — or without a preset — returns a usage error:

```
error: --genesis-override is only valid with --preset genesis-chain
```

### Examples

Override the staking unbonding time and governance voting period:

```bash
apply \
  --preset genesis-chain \
  --genesis-override staking.params.unbonding_time=600s \
  --genesis-override gov.params.voting_period=120s
```

Set a parameter whose value is a JSON boolean:

```bash
apply \
  --preset genesis-chain \
  --genesis-override slashing.params.slash_fraction_double_sign=0.05
```

Force a numeric-looking value to be treated as a string:

```bash
apply \
  --preset genesis-chain \
  --genesis-override mymodule.params.version='"2"'
```
