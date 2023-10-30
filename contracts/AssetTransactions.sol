

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract AssetTransactionSystem {
    address public admin;
    uint256 public taxRate;
    address public taxAdmin; 

    struct Asset {
        uint256 id;
        string name;
        uint256 value;
        address owner;
        bool isRegistered;
    }

    struct Transaction {
        uint256 assetId;
        address from;
        address to;
        uint256 value;
        uint256 taxPaid;
        uint256 timestamp;
    }

    mapping(uint256 => Asset) public assets;
    mapping(uint256 => Transaction) public transactions;
    uint256 public nextAssetId;
    uint256 public nextTransactionId;

    event AssetRegistered(uint256 assetId, string name, uint256 value, address owner);
    event AssetTransferred(uint256 assetId, address from, address to, uint256 value, uint256 taxPaid);

    constructor(uint256 _taxRate, address _taxAdmin) {
        require(_taxAdmin != address(0), "Tax admin address cannot be zero");
        admin = msg.sender;
        taxRate = _taxRate;
        taxAdmin = _taxAdmin;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyOwner(uint256 _assetId) {
        require(assets[_assetId].owner == msg.sender, "Only asset owner can perform this action");
        _;
    }

    function registerAsset(string memory _name, uint256 _value) public {
        uint256 assetId = nextAssetId++;
        assets[assetId] = Asset(assetId, _name, _value, msg.sender, true);
        emit AssetRegistered(assetId, _name, _value, msg.sender);
    }

    function calculateTax(uint256 _assetId) public view returns (uint256) {
        return (assets[_assetId].value * taxRate) / 100;
    }

    function transferAsset(uint256 _assetId, address _to) public payable onlyOwner(_assetId) {
        Asset storage asset = assets[_assetId];
        uint256 taxPaid = calculateTax(_assetId);

        // Check that the correct tax amount is sent with the transaction
        require(msg.value == taxPaid, "Incorrect tax amount");

        // Transfer asset
        asset.owner = _to;
        transactions[nextTransactionId++] = Transaction(_assetId, msg.sender, _to, asset.value, taxPaid, block.timestamp);
        emit AssetTransferred(_assetId, msg.sender, _to, asset.value, taxPaid);

        // Send tax to taxAdmin
        (bool sent, ) = payable(taxAdmin).call{value: taxPaid}("");
        require(sent, "Failed to send tax");
    }

    function getTransactionDetails(uint256 _transactionId) public view returns (Transaction memory) {
        return transactions[_transactionId];
    }
}
