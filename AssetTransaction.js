
const AssetTransactionSystem = artifacts.require("AssetTransactionSystem");

module.exports = async function(callback) {
  try {
    // Get the deployed contract instance
    const contractInstance = await AssetTransactionSystem.deployed();

    // Get accounts
    const accounts = await web3.eth.getAccounts();

    // Set the tax admin (replace with actual address if needed)
    const taxAdmin = accounts[0];
    const user1 = accounts[6];
    const user2 = accounts[7];
    const assetId = 0;

    // Register an asset
    const result = await contractInstance.registerAsset("phone", web3.utils.toWei('1', 'ether'), { from: user1 });
    console.log("Asset Registered:", result);

    // Calculate the tax for the asset
    const taxAmount = await contractInstance.calculateTax(assetId, { from: user1 });
    console.log("Tax Amount (in Wei):", taxAmount.toString());
    
    // Convert tax amount to Ether for readability
    const taxAmountInEther = web3.utils.fromWei(taxAmount, 'ether');
    console.log("Tax Amount (in Ether):", taxAmountInEther);

    // Transfer an asset and pay the tax
    const transferResult = await contractInstance.transferAsset(assetId, user2, { from: user1, value: taxAmount });
    console.log("Asset Transferred:", transferResult);

    callback();
  } catch (error) {
    console.error(error);
    callback(error);
  }
}

