// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IContractSigningRejSBT.sol";

contract multiSigWalletContractSigning {
    address public proposerOwner;
    address[] public owners;
    mapping(address => bool) public isOwner;

    mapping(uint => mapping(address => bool)) public isApproved;
    struct Transaction {
       address to;
       uint256 tokenId;
       bytes data;
       bool executed;
       uint256 numApprovals;
   }

   event SubmitTransaction(address sender, uint txIndex, address recipient, bytes data);
   event ApproveTransaction(address sender, uint txIndex);
   event ExecuteTransaction(address sender, uint txIndex);

    modifier onlyOwner(){
        require(isOwner[msg.sender] && msg.sender != proposerOwner, "Sender is not owner or is proposer owner");
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

    modifier notApproved(uint _txIndex){
        require(!isApproved[_txIndex][msg.sender], "Transaction already approved by sender");
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
       require(_owners.length > 1, "Multisign wallet must be owned by more than one address");
       proposerOwner = msg.sender;
       for (uint i = 0; i < _owners.length; i++) {
           address owner = _owners[i];
           require(owner != address(0), "Owner can not be zero address");
           require(!isOwner[owner], "Owner not unique");
           isOwner[owner] = true;
           owners.push(owner);
       }
   }

   function submitTransactionWithSignerApproval(
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
               numApprovals: 0
           })
       );
       emit SubmitTransaction(msg.sender, txIndex, _to, _data);

       approveTransaction(txIndex);
   }

   function approveTransaction(
       uint _txIndex
   ) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notApproved(_txIndex) notExpired(_txIndex){
       Transaction storage transaction = transactions[_txIndex];
       transaction.numApprovals += 1;
       isApproved[_txIndex][msg.sender] = true;
       emit ApproveTransaction(msg.sender, _txIndex);
   }

   function approveAndExecuteTransaction(
       uint _txIndex
   ) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notExpired(_txIndex) {
         approveTransaction(_txIndex);
       Transaction storage transaction = transactions[_txIndex];
       require(
           transaction.numApprovals == owners.length - 1 && isApproved[_txIndex][proposerOwner] == false,
           "All owners must approve the transaction, except the proposerOwner"
       );
       (bool success, ) = transaction.to.call(
           transaction.data
       );
       require(success, "Transaction execution failed");
       transaction.executed = true;
       emit ExecuteTransaction(msg.sender, _txIndex);
   }
}