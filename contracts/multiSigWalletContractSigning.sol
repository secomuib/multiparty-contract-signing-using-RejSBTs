// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IContractSigningRejSBT.sol";

contract multiSigWalletContractSigning {
    address[] public owners;
    mapping(address => bool) public isOwner;

    mapping(uint => mapping(address => bool)) public isConfirmed;
    struct Transaction {
       address to;
       uint256 tokenId;
       bytes data;
       bool executed;
       uint256 numConfirmations;
   }

   event Deposit(address indexed sender, uint value, uint balance);
   event SubmitTransaction(address sender, uint txIndex, address recipient, bytes data);
   event ConfirmTransaction(address sender, uint txIndex);
   event ExecuteTransaction(address sender, uint txIndex);
   event RevokeConfirmation(address sender, uint txIndex);

    modifier onlyOwner(){
        require(isOwner[msg.sender], "Sender is not owner");
        _;
    }
    
    modifier txExists(uint _txIndex){
        require(_txIndex < transactions.length, "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint _txIndex){
        require(!transactions[_txIndex].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint _txIndex){
        require(!isConfirmed[_txIndex][msg.sender], "Transaction already confirmed by sender");
        _;
    }

    modifier notExpired(uint _txIndex){
        address contractSigningAddress = transactions[_txIndex].to;
        IContractSingnigRejSBT ContractSigningRejSBT = IContractSingnigRejSBT(contractSigningAddress);
        require( ContractSigningRejSBT.getState(transactions[_txIndex].tokenId) != IContractSingnigRejSBT.IBEState(4), "Contract signature proposal deadline expired");
        _;
    }

    Transaction[] public transactions;

   constructor(address[] memory _owners) {
       require(_owners.length > 1, "Multisign walled must be owned by more than one address");
       for (uint i = 0; i < _owners.length; i++) {
           address owner = _owners[i];
           require(owner != address(0), "Owner can not be zero address");
           require(!isOwner[owner], "Owner not unique");
           isOwner[owner] = true;
           owners.push(owner);
       }
   }

   receive() external payable {
       emit Deposit(msg.sender, msg.value, address(this).balance);
   }

   function submitTransactionWithSignerConfirmation(
       address _to,
       uint256 _tokenId,
       bytes memory _data
   ) public onlyOwner {
       uint txIndex = transactions.length;
       transactions.push(
           Transaction({
               to: _to,
               tokenId: _tokenId,
               data: _data,
               executed: false,
               numConfirmations: 0
           })
       );
       emit SubmitTransaction(msg.sender, txIndex, _to, _data);

       confirmTransaction(txIndex);
   }

   function confirmTransaction(
       uint _txIndex
   ) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notConfirmed(_txIndex) notExpired(_txIndex){
       Transaction storage transaction = transactions[_txIndex];
       transaction.numConfirmations += 1;
       isConfirmed[_txIndex][msg.sender] = true;
       emit ConfirmTransaction(msg.sender, _txIndex);
   }

   function confirmAndExecuteTransaction(
       uint _txIndex
   ) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notExpired(_txIndex) {
         confirmTransaction(_txIndex);
       Transaction storage transaction = transactions[_txIndex];
       require(
           transaction.numConfirmations == owners.length,
           "All owners must confirm the transaction"
       );
       (bool success, ) = transaction.to.call(
           transaction.data
       );
       require(success, "Transaction execution failed");
       transaction.executed = true;
       emit ExecuteTransaction(msg.sender, _txIndex);
   }

   function revokeConfirmation(
       uint _txIndex
   ) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
       Transaction storage transaction = transactions[_txIndex];
       require(isConfirmed[_txIndex][msg.sender], "Transaction not confirmed from sender");
       transaction.numConfirmations -= 1;
       isConfirmed[_txIndex][msg.sender] = false;
       emit RevokeConfirmation(msg.sender, _txIndex);
   }
}