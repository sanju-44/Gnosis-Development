/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.27",

  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [vars.get("wallet1key")],
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
