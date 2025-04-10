// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IContractSigningRejSBT.sol";

contract multiSigWalletContractSigning {
    address public proposerOwner;
    address[] public owners;
    mapping(address => bool) public isOwner;

    mapping(uint => mapping(address => bool)) public isApproved;
    mapping(uint => Transaction) public transactions;
    struct Transaction {
       address to;
       uint256 tokenId;
       bytes data;
       bool executed;
       uint256 numApprovals;
   }

   event SubmitTransaction(address sender, uint tokenId, address recipient, bytes data);
   event ApproveTransaction(address sender, uint tokenId);
   event ExecuteTransaction(address sender, uint tokenId);

    modifier onlyOwner(){
        require(isOwner[msg.sender] && msg.sender != proposerOwner, "Sender is not owner or is proposer owner");
        _;
    }

    modifier txExists(uint _tokenId){
        require(transactions[_tokenId].to != address(0), "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint _tokenId){
        require(!transactions[_tokenId].executed, "Transaction already executed");
        _;
    }

    modifier notApproved(uint _tokenId){
        require(!isApproved[_tokenId][msg.sender], "Transaction already approved by sender");
        _;
    }

    modifier notExpired(uint _tokenId){
        address contractSigningAddress = transactions[_tokenId].to;
        IContractSingnigRejSBT ContractSigningRejSBT = IContractSingnigRejSBT(contractSigningAddress);
        require( ContractSigningRejSBT.getState(_tokenId) != IContractSingnigRejSBT.IBEState(2), "Contract signature proposal deadline expired");
        _;
    }

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
   ) public onlyOwner notExpired(_tokenId){
        require(transactions[_tokenId].to == address(0), "TokenId transaction already exists");

       transactions[_tokenId] = 
           Transaction({
               to: _to,
               tokenId: _tokenId,
               data: _data,
               executed: false,
               numApprovals: 0
           });
       emit SubmitTransaction(msg.sender, _tokenId, _to, _data);

       approveTransaction(_tokenId);
   }

   function approveTransaction(
       uint _tokenId
   ) public onlyOwner txExists(_tokenId) notExecuted(_tokenId) notApproved(_tokenId) notExpired(_tokenId){
       Transaction storage transaction = transactions[_tokenId];
       transaction.numApprovals += 1;
       isApproved[_tokenId][msg.sender] = true;
       emit ApproveTransaction(msg.sender, _tokenId);
   }

   function approveAndExecuteTransaction(
       uint _tokenId
   ) public onlyOwner txExists(_tokenId) notExecuted(_tokenId) notExpired(_tokenId) {
         approveTransaction(_tokenId);
       Transaction storage transaction = transactions[_tokenId];
       require(
           transaction.numApprovals == owners.length - 1 && isApproved[_tokenId][proposerOwner] == false,
           "All owners must approve the transaction, except the proposerOwner"
       );
       (bool success, ) = transaction.to.call(
           transaction.data
       );
       require(success, "Transaction execution failed");
       transaction.executed = true;
       emit ExecuteTransaction(msg.sender, _tokenId);
   }
}