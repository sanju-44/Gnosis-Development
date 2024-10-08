/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.27",

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
