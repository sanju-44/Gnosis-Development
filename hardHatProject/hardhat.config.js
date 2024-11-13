/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const ACCOUNT_1_PRIVATE_KEY = process.env.PUBLIC_ACCOUNT_1_KEY;

module.exports = {
  solidity: "0.8.27",

  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/60a0a02c909741b598a58bc34b179cbf",
      accounts: [ACCOUNT_1_PRIVATE_KEY],
      allowUnlimitedContractSize: true,
    },
  },
};
