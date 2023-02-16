import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";
// require('@openzeppelin/hardhat-upgrades');//引入此插件，否则导入hardhat时找不到upgrades
import "@openzeppelin/hardhat-upgrades";//另一种引入插件的方式


import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
    }, 
    matic_test: {
      url: `https://rpc-mumbai.maticvigil.com`,
      accounts: [process.env.MATIC_TESTNET_PRIVATE_KEY as string, process.env.MATIC_TESTNET_CONFIRM_KEY as string],
    },
    matic: {
      url: `https://polygon-mainnet.infura.io/v3/` + process.env.PROJECT_ID,
      chainId: 137,
      accounts: [process.env.MATIC_PRIVATE_KEY as string],
    }  
  },
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          metadata: {
            bytecodeHash: "none",
          },
          optimizer: {
            enabled: true,
            runs: 0,
          },
        },
      },
    ],
    settings: {
        outputSelection: {
            "*": {
                "*": ["storageLayout"],
            },
        },
    },
  },
  typechain: {
    outDir: "./typechain",
    target: "ethers-v5",
  },
  etherscan: {
    apiKey: {
      matic:        '',
      matic_test:   process.env.POLYGONSCAN_API_KEY as string,
    },
    customChains: [
      {
        network: "matic",
        chainId: 137,
        urls: {
          apiURL: "https://polygon-rpc.com",
          browserURL: "https://polygonscan.com/"
        }
      },
      {
        network: "matic_test",
        chainId: 80001,
        urls: {
          apiURL: `https://rpc-mumbai.maticvigil.com`,
          browserURL: "https://mumbai.polygonscan.com/"
        }
      },
    ]
  },  
  namedAccounts: {
    deployer: 0,
    tokenOwner: 1,
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
    deploy: "./deploy",
    deployments: "./deployments",
  },
};

export default config;
