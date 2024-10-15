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

    const provider = ethers.getDefaultProvider("sepolia"); // Use Sepolia network mentioned in hardhat.config.js
    const owner1Signer = new ethers.Wallet(owner1Private, provider);
    const owner2Signer = new ethers.Wallet(owner2Private, provider);


    // Step 2: Get the GnosisSafe contract instance
    const GnosisSafe = await ethers.getContractAt("GnosisSafe", gnosisSafeAddress);
    console.log("Interacting with deployed GnosisSafe at:", GnosisSafe.address);

    // working functions
    // const owners = GnosisSafe.getOwners()
    // console.log("owners:::::", owners)
    // const getThreshold = GnosisSafe.getThreshold()
    // console.log("getThreshold:::::", getThreshold)
    // const isOwner = GnosisSafe.isOwner(owner1);
    // console.log("isOwner:::::", isOwner)

    const encodedFuncData = GnosisSafe.interface.encodeFunctionData("changeThreshold", [2]);
    console.log("getThresholdBefore:::::", await GnosisSafe.getThreshold());
    console.log("encodedFuncData:::::", encodedFuncData)

    const tx = {
        to: gnosisSafeAddress,               // Address of the Gnosis Safe contract itself
        value: 0,                            // No ETH value required
        data: encodedFuncData,                      // Encoded data for the changeThreshold function
        operation: 0,                        // 0 = CALL, 1 = DELEGATECALL
    };

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
    console.log("await GnosisSafe.nonce():::::", await GnosisSafe.nonce())

    const owner1Signature = await owner1Signer.signMessage(ethers.utils.arrayify(txHash));
    const owner2Signature = await owner2Signer.signMessage(ethers.utils.arrayify(txHash));
    console.log("owner1Signature:::::", owner1Signature);
    console.log("owner2Signature:::::", owner2Signature);

    // Split the signatures into r, s, and v components
    const owner1SplitSignature = ethers.utils.splitSignature(owner1Signature);
    const owner2SplitSignature = ethers.utils.splitSignature(owner2Signature);

    // console.log("owner1SplitSignature:::::", owner1SplitSignature);
    // console.log("owner1SplitSignature.r:::::", owner1SplitSignature.r);
    // console.log("owner1SplitSignature.s:::::", owner1SplitSignature.s);
    // console.log("ethers.utils.hexlify(owner1SplitSignature.v):::::", ethers.utils.hexlify(owner1SplitSignature.v));
    // console.log("owner2SplitSignature:::::", owner2SplitSignature);
    // console.log("owner2SplitSignature.r:::::", owner2SplitSignature.r);
    // console.log("owner2SplitSignature.s:::::", owner2SplitSignature.s);
    // console.log("ethers.utils.hexlify(owner2SplitSignature.v):::::", ethers.utils.hexlify(owner2SplitSignature.v));

    const combinedSignatures = ethers.utils.concat([
        owner1SplitSignature.r,
        owner1SplitSignature.s,
        ethers.utils.hexlify(owner1SplitSignature.v),  // Ensure v is properly concatenated
        owner2SplitSignature.r,
        owner2SplitSignature.s,
        ethers.utils.hexlify(owner2SplitSignature.v)   // Ensure v is properly concatenated
    ]);
    
    console.log("combinedSignatures:::::", combinedSignatures)

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
        combinedSignatures // Array of collected signatures
    );
    console.log("YYYYYYYYYYYYYYYYYYYYY")
    console.log("executeTx:::::", executeTx);
    console.log("getThresholdAfter:::::", await GnosisSafe.getThreshold());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// other funtions of GnosisSafe
