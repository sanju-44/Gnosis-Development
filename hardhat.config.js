/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.27",

  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.API_KEY}`,
      accounts: [process.env.PUBLIC_ACCOUNT_1_KEY],
    },
  },

  settings: {
    optimizer: {
      enabled: true,
      runs: 200,  // Use a low runs value for size optimization (can go lower, e.g., 50)
    },
  },

  outputSelection: {
    "*": {
      "*": [
        "metadata", "evm.bytecode", "evm.deployedBytecode",
        "abi"
      ],
      "": ["ast"]
    },
  },
};
