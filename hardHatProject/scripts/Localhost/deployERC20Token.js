const { ethers } = require("hardhat");

// replace with actual values
const tokenName = "REAL token"; // name of the token
const tokenSymbol = "RET"; // symbol of the token
const tokenCount = "1000" // Set your initial supply token count
const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" // Token reciever --> hardhat default signer

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const initialSupply = ethers.utils.parseUnits(tokenCount, 18); // Set your initial supply here

    const GLDToken = await ethers.getContractFactory("TokenContract");
    const token = await GLDToken.deploy(owner, initialSupply, tokenName, tokenSymbol);

    await token.deployed();
    console.log("Token deployed to:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


// ***** already deployed token contract address *****
// 0x50F5a340131695e86E60b35E71028bF49F60b154
