## Genesis Ceremony Tasks

### assemble-genesis

Assembles the final `genesis.json` after collecting gentxs and uploads it to S3.

| Field | Type | Description |
|---|---|---|
| `overrides` | `map[string]json.RawMessage` | Optional. Flat map of dotted-path keys (e.g. `staking.params.unbonding_time`) to raw JSON values applied to `genesis.app_state` after `collect-gentxs` runs. Unknown modules, malformed paths, or non-object intermediates cause a hard failure. |

<!-- TODO: expand with full field reference and example YAML/JSON config -->

### generate-gentx

> **Note:** The `genesisParams` field has been removed from this task. Genesis customization is now handled via the `overrides` field on the `assemble-genesis` task instead.

<!-- TODO: expand -->