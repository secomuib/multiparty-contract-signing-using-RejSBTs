# Multiparty Contract Signing Protocol using RejSBT Protocol

A POC implementation for the Multiparty Contract Signing Protocol using Rejectable Soulbound Tokens protocol.

## Install dependencies and deployment

### Settings

1. Set .env file with the following variables:
  
    `MNEMONIC`: for the used wallet mnemonic

    `COINMARKETCAP_API_KEY`: for being able to use hardhat-gas-reporter.

    `MAINET_ETHERSCAN_API_KEY`:

    `POLYGONSCAN_API_KEY`:

    `INFURA_API_KEY`: as network rpc.

### Install dependencies

Run:

```
yarn install
```

##  Run unit tests

Run:

```
npm run test:contractSigningRejSBT
```
