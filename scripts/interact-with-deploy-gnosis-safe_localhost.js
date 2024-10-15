require("dotenv").config();
const { ethers } = require("hardhat");


// Step 1: Provide the GnosisSafe contract address (deployed earlier)
const gnosisSafeAddress = "0x8dAF17A20c9DBA35f005b6324F493785D239719d"; // Replace with actual address everytime you deploy

async function main() {
    const owner1 = process.env.ACCOUNT_1;
    const owner2 = process.env.ACCOUNT_2;

    // Step 2: Get the GnosisSafe contract instance
    const GnosisSafe = await ethers.getContractAt("GnosisSafe", gnosisSafeAddress);
    console.log("Interacting with deployed GnosisSafe at:", gnosisSafeAddress);

    const owners = await GnosisSafe.getOwners();
    const isOwner1 = await GnosisSafe.isOwner(owner1);
    console.log("owner1:::::", owner1);
    console.log("owner2:::::", owner2);
    const isOwner2 = await GnosisSafe.isOwner(owner2);
    const getThreshold = await GnosisSafe.getThreshold();

    // ***** change threshold *****
    console.log("getThresholdBefore:::::", getThreshold);
    // Encoding the changeThreshold call
    const encodedFuncData = GnosisSafe.interface.encodeFunctionData("changeThreshold", [2]);
    console.log("encodedFuncData:::::", encodedFuncData)
    // Create the transaction object to propose
    const tx = {
        to: gnosisSafeAddress,               // Address of the Gnosis Safe contract itself
        value: 0,                            // No ETH value required
        data: encodedFuncData,         // Encoded data for the changeThreshold function
        operation: 0,                        // 0 = CALL, 1 = DELEGATECALL
    };
    // Assuming we are interacting from one of the owners
    const owner1Signer = ethers.provider.getSigner(owner1); // Owner 0's signer
    const owner2Signer = ethers.provider.getSigner(owner2);
    // console.log("ownerSigner:::::", ownerSigner)
    // Sign the transaction
    const txHash = await GnosisSafe.getTransactionHash(
        tx.to,
        tx.value,
        tx.data,
        tx.operation,
        0, // SafeTxGas (you can adjust the gas)
        0, // BaseGas
        0, // GasPrice
        ethers.constants.AddressZero, // GasToken
        ethers.constants.AddressZero, // RefundReceiver
        await GnosisSafe.nonce()
    );
    console.log("txHash:::::", txHash)
    // The owner signs the transaction hash
    const txByteArray = ethers.utils.arrayify(txHash);
    console.log("txByteArray:::::", txByteArray)

    const owner1Signature = await owner1Signer.signMessage(ethers.utils.arrayify(txByteArray));
    const owner2Signature = await owner2Signer.signMessage(ethers.utils.arrayify(txByteArray));
    console.log("owner1Signature:::::", owner1Signature);
    console.log("owner2Signature:::::", owner2Signature);

    // Split the signatures into r, s, and v components
    const owner1SplitSignature = ethers.utils.splitSignature(owner1Signature);
    const owner2SplitSignature = ethers.utils.splitSignature(owner2Signature);

    const combinedSignatures = ethers.utils.concat([
        owner1SplitSignature.r,
        owner1SplitSignature.s,
        ethers.utils.hexlify(owner1SplitSignature.v),  // Ensure v is properly concatenated
        owner2SplitSignature.r,
        owner2SplitSignature.s,
        ethers.utils.hexlify(owner2SplitSignature.v)   // Ensure v is properly concatenated
    ]);
    console.log("combinedSignatures:::::", combinedSignatures);
    console.log("owner1SplitSignature.r:::::", owner1SplitSignature.r);
    console.log("owner1SplitSignature.s:::::", owner1SplitSignature.s);
    console.log("ethers.utils.hexlify(owner1SplitSignature.v).s:::::", ethers.utils.hexlify(owner1SplitSignature.v));

    const combinedSignatures1 = ethers.utils.concat([owner1Signature, owner2Signature]);
    console.log("combinedSignatures1:::::", combinedSignatures1)

    // Now execute the transaction with the necessary owner signatures
    const executeTx = await GnosisSafe.execTransaction(
        tx.to,
        tx.value,
        tx.data,
        tx.operation,
        0, // SafeTxGas
        0, // BaseGas
        0, // GasPrice
        ethers.constants.AddressZero, // GasToken
        ethers.constants.AddressZero, // RefundReceiver
        combinedSignatures // Array of collected signatures
    );
    console.log("executeTx:::::", executeTx);
    console.log("getThresholdAfter:::::", getThreshold);

    // console.log("owners:::::", owners);
    // console.log("isOwner1:::::", isOwner1);
    // console.log("isOwner2:::::", isOwner2);
    // console.log("getThreshold:::::", getThreshold);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// other funtions of GnosisSafe
