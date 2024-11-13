const { ethers } = require ("hardhat");

async function main() {
    const implement = await ethers.getContractFactory("ImplementMyToken");
    const implementContract = await implement.deploy()
    await implementContract.deployed()
    console.log("implementation deployed to: ", implementContract.address)
    
    const proxy = await ethers.getContractFactory("ProxyMyToken");
    const proxyContract = await proxy.deploy()
    await proxyContract.deployed()
    console.log("proxy deployed to: ",proxyContract.address)
    console.log("XXXXX:::::",proxyContract)

    await proxyContract.upDateLogic(implementContract.address);
    console.log("XXXXX:::::", proxyContract)


    const mintInterface = new ethers.utils.Interface([
        "function mint(address to, uint256 amount)"
    ]);
    
    // Encode the function call data to pass to the proxy's fallback
    const data = await mintInterface.encodeFunctionData("mint", ["0x72bA251b1FBC2d9268B93Aa74CD1cfcFC2C62BB8", ethers.utils.parseEther("100")]);

    const tx = await ethers.provider.sendTransaction({
        to: proxyContract.address,
        data: data
    });

    // Send transaction to trigger the fallback

    const receipt = await tx.wait();
    
    console.log("Fallback delegate call transaction hash:", receipt.transactionHash);
}
  
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});