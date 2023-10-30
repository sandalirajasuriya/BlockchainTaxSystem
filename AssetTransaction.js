const AssetTransactionSystem = artifacts.require("AssetTransactionSystem");

  module.exports = async function(callback) {
  try {
    // Get the deployed contract instance
    const contractInstance = await AssetTransactionSystem.deployed();

    // Get accounts
    const accounts = await web3.eth.getAccounts();

    // Set the tax admin (replace with actual address if needed)
    const taxAdmin = accounts[0];
    const user1 = accounts[5];
    const assetId = 3;

    // Register an asset
    const result = await contractInstance.registerAsset("Jeep", web3.utils.toWei('1', 'ether'), { from: user1 });
    console.log("Asset Registered:", result);

    // Calculate the tax for the asset
    const taxAmount = await contractInstance.calculateTax(assetId, { from: user1 });
    console.log("Tax Amount (in Wei):", taxAmount.toString());
    
    // Convert tax amount to Ether for readability
    const taxAmountInEther = web3.utils.fromWei(taxAmount, 'ether');
    console.log("Tax Amount (in Ether):", taxAmountInEther);

    // Send the exact tax amount to the contract
    const taxPaymentTx = await web3.eth.sendTransaction({ from: user1, to: contractInstance.address, value: taxAmount });
    console.log("Tax Paid:", taxPaymentTx);

    // Check contract's Ether balance
    const balance = await web3.eth.getBalance(contractInstance.address);
    console.log("Contract Ether Balance:", web3.utils.fromWei(balance, 'ether'));

    // Transfer an asset
    const transferResult = await contractInstance.transferAsset(assetId, accounts[6], { from: user1 });
    console.log("Asset Transferred:", transferResult);

    callback();
  } catch (error) {
    console.error(error);
    callback(error);
  }
}

