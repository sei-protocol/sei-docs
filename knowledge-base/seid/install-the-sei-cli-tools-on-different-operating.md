---
title: 'How do I install the Sei CLI tools on different operating systems?'
description: 'How do I install the Sei CLI tools on different operating systems?'
---

# How do I install the Sei CLI tools on different operating systems?

### macOS Installation

**Method 1: Using the Install Script**

```
# One-line installer (bash)
curl -sSL https://raw.githubusercontent.com/sei-protocol/sei-chain/main/scripts/quick_install.sh | bash

# Verify installation
seid version

```

**Method 2: Building from Source**

```
# Prerequisites: Install Go 1.21+ first
brew install go@1.21

# Clone the repository
git clone https://github.com/sei-protocol/sei-chain.git
cd sei-chain

# Build the binary
make install

# Verify installation
seid version

```

### Linux Installation

**Ubuntu/Debian**

```
# Update and install dependencies
sudo apt update
sudo apt install -y build-essential git curl wget jq

# Install Go (if not installed)
wget -q -O - https://git.io/vQhTU | bash -s -- --version 1.21.0
source ~/.profile

# Clone and build
git clone https://github.com/sei-protocol/sei-chain.git
cd sei-chain
make install

# Verify installation
seid version

```

**CentOS/RHEL/Fedora**

```
# Install dependencies
sudo dnf install -y git curl wget make gcc

# Install Go (if not installed)
wget -q -O - https://git.io/vQhTU | bash -s -- --version 1.21.0
source ~/.profile

# Clone and build
git clone https://github.com/sei-protocol/sei-chain.git
cd sei-chain
make install

# Verify installation
seid version

```

### Windows Installation

The recommended approach for Windows users is to use WSL (Windows Subsystem for Linux) and follow the Linux installation instructions.
