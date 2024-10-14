const { ethers } = require("hardhat");
const Safe  = require("@gnosis.pm/safe-core-sdk").default;

const safeAddress = "0xYourSafeAddress";
const threshold = 1; // Adjust the threshold as needed

const safe = new Safe(safeAddress, threshold, ethers.provider);


const wallet1 = new ethers.Wallet("your_private_key_1");
const wallet2 = new ethers.Wallet("your_private_key_2");

const signatures = await Promise.all(
    signers.map(async (signer) => {
      const signature = await safe.signTransaction(signer, {
        to,
        value,
        data,
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
      });
      return signature;
    })
  );

  console.log("check::::", )

const combinedSignatures = ethers.utils.arrayify(signatures.join(""));

async function createSignatures() {
    const [signer1, signer2] = await ethers.getSigners();
    const safeAddress = "0xYourSafeAddress";
    const threshold = 2;
  
    const safe = new Safe(safeAddress, threshold, ethers.provider);
  
    // ... prepare transaction data
  
    const signatures = await Promise.all(
      [signer1, signer2].map(async (signer) => {
        const signature = await safe.signTransaction(signer, {
          // ... transaction data
        });
        return signature;
      })
    );
  
    const combinedSignatures = ethers.utils.arrayify(signatures.join(""));
  
    console.log("Combined signatures:", combinedSignatures);
  }
  
  createSignatures()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });