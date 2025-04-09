import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { HardhatUserConfig } from "hardhat/types/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-solhint";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const CHAIN_IDS = {
  HARDHAT: 1337,
  MAINNET: 1,
  RINKEBY: 4
};

const MNEMONIC = process.env.MNEMONIC || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";
const MAINET_ETHERSCAN_API_KEY = process.env.MAINET_ETHERSCAN_API_KEY || "";

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
  gasReporter: {
    currency: "USD",
    L1: "ethereum",
    coinmarketcap: COINMARKETCAP_API_KEY,
    enabled: true,
    currencyDisplayPrecision: 4,
    noColors: false,
    L1Etherscan: MAINET_ETHERSCAN_API_KEY,
    reportFormat: "legacy",
    outputFile: "gas-report.txt"
  }  
};

export default config;