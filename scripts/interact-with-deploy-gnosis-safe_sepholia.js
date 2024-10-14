require("dotenv").config();
const { ethers } = require("hardhat");
const Safe = require("@gnosis.pm/safe-core-sdk").default;


// Step 1: Provide the GnosisSafe contract address (deployed earlier)
const gnosisSafeAddress = "0xEdB89B030518012aD583d6569Fe1E59A2628FA06"; // Replace with actual address everytime you deploy

async function main() {
    const owner1 = process.env.PUBLIC_ACCOUNT_1; // 0x72bA251b1FBC2d9268B93Aa74CD1cfcFC2C62BB8
    const owner2 = process.env.PUBLIC_ACCOUNT_2; // 0x6eDCf3aE8aC36B18a4590D764eE88b429D48243d
    const owner1Private = process.env.PUBLIC_ACCOUNT_1_KEY;
    const owner2Private = process.env.PUBLIC_ACCOUNT_2_KEY;

    const provider = ethers.getDefaultProvider("sepolia"); // Use Sepolia network
    const owner1Signer = new ethers.Wallet(owner1Private, provider);
    const owner2Signer = new ethers.Wallet(owner2Private, provider);


    // Step 2: Get the GnosisSafe contract instance
    const GnosisSafe = await ethers.getContractAt("GnosisSafe", gnosisSafeAddress);
    console.log("Interacting with deployed GnosisSafe at:", gnosisSafeAddress);

    const owners = await GnosisSafe.getOwners();
    console.log("owners:::::", owners);
    const isOwner1 = await GnosisSafe.isOwner(owner1);
    // console.log("isOwner1:::::", isOwner1);
    const isOwner2 = await GnosisSafe.isOwner(owner2);
    // console.log("isOwner2:::::", isOwner2);
    const getThreshold = await GnosisSafe.getThreshold();

    // ***** change threshold *****
    console.log("getThresholdBefore:::::", getThreshold);
    // Encoding the changeThreshold call
    const changeThresholdTxData = GnosisSafe.interface.encodeFunctionData("changeThreshold", [1]);
    console.log("changeThresholdTxData:::::", changeThresholdTxData)
    // Create the transaction object to propose
    const tx = {
        to: gnosisSafeAddress,               // Address of the Gnosis Safe contract itself
        value: 0,                            // No ETH value required
        data: changeThresholdTxData,         // Encoded data for the changeThreshold function
        operation: 0,                        // 0 = CALL, 1 = DELEGATECALL
    };
    // Assuming we are interacting from one of the owners
    // const owner1Signer = ethers.provider.getSigner(owner1); // Owner 0's signer
    // const owner2Signer = ethers.provider.getSigner(owner2);
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

    // console.log("txHash:::::", txHash)
    console.log("await GnosisSafe.nonce():::::", await GnosisSafe.nonce())
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

    console.log("owner1SplitSignature:::::", owner1SplitSignature);
    console.log("owner1SplitSignature.r:::::", owner1SplitSignature.r);
    console.log("owner1SplitSignature.s:::::", owner1SplitSignature.s);
    console.log("ethers.utils.hexlify(owner1SplitSignature.v):::::", ethers.utils.hexlify(owner1SplitSignature.v));
    console.log("owner2SplitSignature:::::", owner2SplitSignature);
    console.log("owner2SplitSignature.r:::::", owner2SplitSignature.r);
    console.log("owner2SplitSignature.s:::::", owner2SplitSignature.s);
    console.log("ethers.utils.hexlify(owner2SplitSignature.v):::::", ethers.utils.hexlify(owner2SplitSignature.v));

    const combinedSignatures = ethers.utils.concat([
        owner1SplitSignature.r,
        owner1SplitSignature.s,
        ethers.utils.hexlify(owner1SplitSignature.v),  // Ensure v is properly concatenated
        owner2SplitSignature.r,
        owner2SplitSignature.s,
        ethers.utils.hexlify(owner2SplitSignature.v)   // Ensure v is properly concatenated
    ]);
    
    console.log("combinedSignatures:::::", combinedSignatures)

    const combinedSignatures1 = ethers.utils.concat([owner1Signature, owner2Signature]);
    console.log("combinedSignatures1:::::", combinedSignatures1)

    // Now execute the transaction with the necessary owner signatures
    console.log("XXXXXXXXXXXXXXXXXXXX")
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
        "0x00000000000000000000000072ba251b1fbc2d9268b93aa74cd1cfcfc2c62bb8000000000000000000000000000000000000000000000000000000000000000001" // Array of collected signatures
    );
    console.log("ZZZZZZZZZZZZZZZZZZZ")
    console.log("executeTx:::::", executeTx);
    console.log("getThresholdAfter:::::", getThreshold);

    console.log("owners:::::", owners);
    console.log("isOwner1:::::", isOwner1);
    console.log("isOwner2:::::", isOwner2);
    console.log("getThreshold:::::", getThreshold);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// other funtions of GnosisSafe
