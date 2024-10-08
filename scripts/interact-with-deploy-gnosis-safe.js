require("dotenv").config();
const { ethers } = require("hardhat");

// Step 1: Provide the GnosisSafe contract address (deployed earlier)
const gnosisSafeAddress = process.env.deployedGnosisSafeProxyAddress; // Replace with actual address

async function main() {
    // Step 2: Get the GnosisSafe contract instance
    const GnosisSafe = await ethers.getContractAt("GnosisSafe", gnosisSafeAddress);
    console.log("Interacting with deployed GnosisSafe at:", gnosisSafeAddress);


    const owners = await GnosisSafe.getOwners();
    // const isOwner = await GnosisSafe.isOwner("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
    // const getThreshold = await GnosisSafe.getThreshold();

    // console.log("owners:::::", owners);
    // console.log("isOwner:::::", isOwner);
    // console.log("getThreshold:::::", getThreshold);

    const getThreshold = await GnosisSafe.changeThreshold(1);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// other funtions of GnosisSafe
