import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { HardhatUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-solhint";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const CHAIN_IDS = {
  HARDHAT: 1337,
  MAINNET: 1,
  RINKEBY: 4
};

const MNEMONIC = process.env.MNEMONIC || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";

const getInfuraURL = (network: string) => {
  return `https://${network}.infura.io/v3/${INFURA_API_KEY}`;
};

const config: HardhatUserConfig = {
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

export default config;