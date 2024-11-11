// ********** contract.sol **********

require('dotenv').config();
const { ethers } = require('hardhat');

const ImplementationContractAddress = "0x646A03AD8b78dc2d0ea5b5FD2702EEC63550f603";
const ProxyContractAddress = "0xEf240F3549455406C166d9aED385A80Ca3BE0f06"

async function main() {
  
    // const Implementation = await ethers.getContractFactory("Implementation");
    // const ImplementationContract = await Implementation.deploy();
    // await ImplementationContract.deployed();
    // console.log("ImplementationContract deployed to:", ImplementationContract.address);

    const ImplementationContract = await ethers.getContractAt("Implementation", ImplementationContractAddress);
    console.log("ImplementationContract at:", ImplementationContract.address);

    // const Proxy = await ethers.getContractFactory("UpgradeableProxy");
    // const ProxyContract = await Proxy.deploy("0x646A03AD8b78dc2d0ea5b5FD2702EEC63550f603");
    // await ProxyContract.deployed();
    // console.log("ProxyContract deployed to:", ProxyContract.address);

    const ProxyContract = await ethers.getContractAt("UpgradeableProxy", ProxyContractAddress);
    console.log("ProxyContract at:", ProxyContract.address);

    // const Proxy = await ethers.getContractFactory("UpgradeableProxy");
    // const proxy = Proxy.attach(ProxyContract.address);
  
    // // Call greet function via delegatecall on the proxy contract
    // const greetMessage = await proxy.implementation();
    // console.log("Greet message from Implementation It is now being indexed.contract:", greetMessage);

    const Implementation = await ethers.getContractAt("IImplementation", ProxyContractAddress);
    const proxyWithInterface = Implementation.attach(ProxyContractAddress);
    console.log("Implementation:", await proxyWithInterface.greet());
    

}
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });