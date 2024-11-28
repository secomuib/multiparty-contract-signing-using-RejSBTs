"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = require("path");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-solhint");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, "./.env") });
const CHAIN_IDS = {
    HARDHAT: 1337,
    MAINNET: 1,
    RINKEBY: 4
};
const MNEMONIC = process.env.MNEMONIC || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const getInfuraURL = (network) => {
    return `https://${network}.infura.io/v3/${INFURA_API_KEY}`;
};
const config = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: CHAIN_IDS.HARDHAT,
            accounts: { mnemonic: MNEMONIC },
        },
        mainnet: {
            url: getInfuraURL("mainnet"),
            chainId: CHAIN_IDS.MAINNET,
            accounts: { mnemonic: MNEMONIC }
        },
        rinkeby: {
            url: getInfuraURL("rinkeby"),
            chainId: CHAIN_IDS.RINKEBY,
            accounts: { mnemonic: MNEMONIC }
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },
    /* namedAccounts: {
      deployer: {
        default: 0 // Here this will by default take the first account as deployer
      }
    }, */
    /* gasReporter: {
      currency: "USD",
      L1: "polygon",
      coinmarketcap: COINMARKETCAP_API_KEY,
      L1Etherscan:
      "XJFNFSFWE1V79TGG4H3QBMI9VMMAS1VDYG",
      enabled: true,
      currencyDisplayPrecision: 4,
      outputFile: "gas-report.txt",
      noColors: true,
      gasPriceApi:
        "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
    } */
};
exports.default = config;
