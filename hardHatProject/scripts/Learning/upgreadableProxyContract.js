// upgreadableProxyContract ********** contract.sol **********

require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  
    const Implementation = await ethers.getContractFactory("contracts/upgreadableProxyContract.sol:ERC20Implementation");
    const ImplementationContract = await Implementation.deploy();
    await ImplementationContract.deployed();
    console.log("ImplementationContract deployed at:", ImplementationContract.address);

    // // const ImplementationContract = await ethers.getContractAt("Implementation", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    // // console.log("ImplementationContract at:", ImplementationContract.address);

    const Proxy = await ethers.getContractFactory("contracts/upgreadableProxyContract.sol:UpgradeableProxy");
    const ProxyContract = await Proxy.deploy(ImplementationContract.address);
    await ProxyContract.deployed();
    console.log("ProxyContract deployed at:", ProxyContract.address);

    // // const ProxyContract = await ethers.getContractAt("UpgradeableProxy", "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
    // // console.log("ProxyContract at:", ProxyContract.address);

    console.log("###calling proxy contract funtions!!!...");
    const ProxyWithProxyInterface = await ethers.getContractAt("contracts/upgreadableProxyContract.sol:IUpgradeableProxy", ProxyContract.address);
    const ProxyWithProxyInterfaceContract = ProxyWithProxyInterface.attach(ProxyContract.address);
    console.log("    getting implementation contract address:", await ProxyWithProxyInterfaceContract.getLogicContractAddress());

    console.log("###calling implementaion contract funtions on behalf of proxy contract!!!...");
    const ProxyWithImplementationInterface = await ethers.getContractAt("contracts/upgreadableProxyContract.sol:IERC20Implementation", ProxyContract.address);
    const ProxyWithImplementationInterfaceContract = ProxyWithImplementationInterface.attach(ProxyContract.address);
    console.log("    check totalsupply of tokens:", await ProxyWithImplementationInterfaceContract.totalSupply());
    console.log("    ##intializing contract with 100 tokens!!!...", );
    await ProxyWithImplementationInterfaceContract.initialize("Real token", "RET", 100)
    console.log("        check totalsupply of tokens after contract initializing:", await ProxyWithImplementationInterfaceContract.totalSupply());
    console.log("        check balance of tokens who intiated token:", await ProxyWithImplementationInterfaceContract.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"));
    console.log("    minting 100 more tokenns!!!...");
    await ProxyWithImplementationInterfaceContract.mint("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 100)
    console.log("        check totalsupply of tokens after minting:", await ProxyWithImplementationInterfaceContract.totalSupply());
    console.log("        check balance of tokens to the minted address token:", await ProxyWithImplementationInterfaceContract.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"));


    console.log("###changing logic and check the storage of proxy contract!!!...");
    const Implementation1 = await ethers.getContractFactory("contracts/upgreadableProxyContract.sol:ERC20Implementation");
    const ImplementationContract1 = await Implementation1.deploy();
    await ImplementationContract1.deployed();
    console.log("    for that new logic contract is deployed at: ", ImplementationContract1.address);
    const ProxyWithProxyInterface1 = await ethers.getContractAt("contracts/upgreadableProxyContract.sol:IUpgradeableProxy", ProxyContract.address);
    const ProxyWithProxyInterfaceContract1 = ProxyWithProxyInterface1.attach(ProxyContract.address);
    console.log("    changing the logic contract address!!!...");
    await ProxyWithProxyInterfaceContract1.upgradeLogic(ImplementationContract1.address)


    const ProxyWithImplementationInterface1 = await ethers.getContractAt("contracts/upgreadableProxyContract.sol:IERC20Implementation", ProxyContract.address);
    const ProxyWithImplementationInterfaceContract1 = ProxyWithImplementationInterface1.attach(ProxyContract.address);
    console.log("    check totalsupply of tokens:", await ProxyWithImplementationInterfaceContract1.totalSupply());
    await ProxyWithImplementationInterfaceContract1.mint("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 100);
    console.log("    check totalsupply of tokens after minting", await ProxyWithImplementationInterfaceContract1.totalSupply());
    console.log("    check balance of tokens:", await ProxyWithImplementationInterfaceContract1.balanceOf("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"));
    console.log("    check token name:", await ProxyWithImplementationInterfaceContract1.name());
    console.log("    check token symbol:", await ProxyWithImplementationInterfaceContract1.symbol());
    console.log("    check contract owner:", await ProxyWithImplementationInterfaceContract1.owner());



    // const ProxyImplemetationCall = await ethers.getContractAt("IImplementation", ProxyContract.address);
    // const proxyWithInterface = ProxyImplemetationCall.attach(ProxyContract.address);
    // console.log("Implementation:", await proxyWithInterface.greet());
    // console.log("Implementation:", await proxyWithInterface.add(12, 8));
    // console.log("Implementation:", await proxyWithInterface.subtract(12, 8));

}
  
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});