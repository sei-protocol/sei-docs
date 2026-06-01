## `--genesis-override`

**Flag:** `--genesis-override <module.field[.field...]>=<value>`  
**Type:** string (repeatable)  
**Valid with:** `--preset genesis-chain` only

Overrides genesis parameters when deploying a node with `--preset genesis-chain`. Keys use dotted Cosmos module paths; values are parsed as JSON when valid (numbers, booleans, objects, arrays, quoted strings), or stored as raw strings otherwise.

```bash
seid apply \
  --preset genesis-chain \
  --genesis-override staking.params.unbonding_time=600s \
  --genesis-override gov.params.voting_period=300s
```

To force a numeric-looking value to be treated as a string, wrap it in JSON quotes:

```bash
--genesis-override foo.bar='"42"'
```

> **Note:** Using `--genesis-override` with any preset other than `genesis-chain` returns an error.

<!-- TODO: expand with full list of supported module paths and link to genesis config reference -->