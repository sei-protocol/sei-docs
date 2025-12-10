---
title: 'Why does my seid command get killed immediately on macOS?'
description: 'Why does my seid command get killed immediately on macOS?'
---

# Why does my seid command get killed immediately on macOS?

Many macOS users encounter an issue where the `seid` command is killed immediately after execution, often showing an error like `zsh: killed seid`. This typically happens because:

- The binary isn't properly code-signed for macOS security

- There may be memory limitations or conflicts

- macOS security features (Gatekeeper) might be blocking execution

### Solution: Re-sign the Binary

The most effective solution is to re-sign the `seid` binary:

```
# Find the binary location (typically in ~/go/bin/)
which seid
# Output: /Users/yourusername/go/bin/seid

# Re-sign the binary
codesign --sign - --force ~/go/bin/seid

# Verify it works now
seid version

```

This issue often occurs after macOS updates or when upgrading the binary. The codesigning process tells macOS the binary is safe to execute and prevents it from being terminated by security mechanisms.

### Alternative Solutions

If re-signing doesn't work:

- **Check Memory Issues**:

```
# Run with verbose logging
GODEBUG=madvdontneed=1 seid start

```

- **Reinstall from Source**:

```
cd sei-chain
git pull
make install

```

- **Check for Conflicts**:

```
# See if process is being killed by system
log show --predicate 'eventMessage contains "seid"' --last 1h

```

## How do I fix "seienv propose-upgrade" being killed immediately?

If `seienv propose-upgrade` is being killed immediately (similar to the error shown below), it's usually due to the same code signing issues mentioned above:

```
seienv propose-upgrade v6.0.6 --seconds 300
2 err | 08:27:19 AM
[1] 62560 killed seienv propose-upgrade v6.0.6 --seconds 300

```

### Solution:

- **Re-sign the seienv binary**:

```
which seienv
# Output: /Users/yourusername/go/bin/seienv

codesign --sign - --force ~/go/bin/seienv

# Test it
seienv version

```

- **If that doesn't work, rebuild from source**:

```
git clone https://github.com/sei-protocol/sei-chain.git
cd sei-chain/sei-env
make install

```

This issue is common on macOS systems, especially after system updates.
