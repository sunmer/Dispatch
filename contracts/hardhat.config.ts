import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-toolbox";

dotenv.config({ path: __dirname + '/.env' });
const {  PRIVATE_KEY } = process.env;

/* MATIC */
const config: HardhatUserConfig = {
  solidity: "0.8.19",
   defaultNetwork: "matic",
   networks: {
      hardhat: {},
      matic: {
        url: "https://polygon-rpc.com",
        accounts: [PRIVATE_KEY!]
      }
   },
};
/*
const config: HardhatUserConfig = {
  solidity: "0.8.19",
   defaultNetwork: "base",
   networks: {
      hardhat: {},
      base: {
        url: "https://mainnet.base.org",
        accounts: [PRIVATE_KEY!]
      }
   },
};

/*const config: HardhatUserConfig = {
  solidity: "0.8.19",
};*/

export default config;
