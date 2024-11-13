// ********** contract.sol **********

require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  
    const Implementation = await ethers.getContractFactory("Implementation");
    const ImplementationContract = await Implementation.deploy();
    await ImplementationContract.deployed();
    console.log("ImplementationContract deployed at:", ImplementationContract.address);

    // const ImplementationContract = await ethers.getContractAt("Implementation", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    // console.log("ImplementationContract at:", ImplementationContract.address);

    const Proxy = await ethers.getContractFactory("UpgradeableProxy");
    const ProxyContract = await Proxy.deploy(ImplementationContract.address);
    await ProxyContract.deployed();
    console.log("ProxyContract deployed at:", ProxyContract.address);

    // const ProxyContract = await ethers.getContractAt("UpgradeableProxy", "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
    // console.log("ProxyContract at:", ProxyContract.address);

    const ProxyImplemetationCall = await ethers.getContractAt("IImplementation", ProxyContract.address);
    const proxyWithInterface = ProxyImplemetationCall.attach(ProxyContract.address);
    console.log("Implementation:", await proxyWithInterface.greet());
    console.log("Implementation:", await proxyWithInterface.add(12, 8));
    console.log("Implementation:", await proxyWithInterface.subtract(12, 8));

}
  
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});