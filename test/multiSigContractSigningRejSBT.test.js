"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
require("@nomiclabs/hardhat-waffle");
const chai_1 = __importDefault(require("chai"));
chai_1.default.use(hardhat_1.waffle.solidity);
const { expect } = chai_1.default;
const contractSBT_NAME = "Contract signing SBT";
const contractSBT_SYMBOL = "CS-SBT";
describe("Contract signing using RejSBT", () => {
    let contractSigningSBT;
    let multiSigWallet;
    let deployer, signer1, signer2, signer3;
    before(async () => {
        [deployer, signer1, signer2, signer3] = await hardhat_1.ethers.getSigners();
        const multiSigWalletOwners = [signer1.address, signer2.address, signer3.address];
        //Deployer user deploys the multiSigWallet 
        const multiSigWalletContractSigning = await hardhat_1.ethers.getContractFactory("multiSigWalletContractSigning");
        //Deployer user deploys the smart contract
        multiSigWallet = await multiSigWalletContractSigning.connect(deployer).deploy(multiSigWalletOwners);
        const contractSigningRSBT = await hardhat_1.ethers.getContractFactory("contractSigningRejSBT");
        //Deployer user deploys the smart contract
        contractSigningSBT = await contractSigningRSBT.connect(deployer).deploy(contractSBT_NAME, contractSBT_SYMBOL);
    });
    /**
     * Deployment
     */
    describe("Deployment", () => {
        it("MultiSign wallet: Contracts deployed successfully", async () => {
            expect(multiSigWallet.address).to.not.be.undefined;
            expect(await multiSigWallet.owner()).to.be.equal(deployer.address);
        });
        it("MultiSign wallet: check owners", async () => {
            expect(await contractSigningSBT.isOwner(signer1.address)).to.be.equal(true);
            expect(await contractSigningSBT.isOwner(signer2.address)).to.be.equal(true);
            expect(await contractSigningSBT.isOwner(signer3.address)).to.be.equal(true);
        });
        it("Contracts deployed successfully", async () => {
            expect(contractSigningSBT.address).to.not.be.undefined;
            /* expect(await contractSigningSBT.owner()).to.be.equal(deployer.address) */
        });
        it("Check name and symbol", async () => {
            expect(await contractSigningSBT.name()).to.be.equal(contractSBT_NAME);
            expect(await contractSigningSBT.symbol()).to.be.equal(contractSBT_SYMBOL);
        });
    });
    /**
     * Mint, Accept, Cancel, Reject a Contract signature SBT
     */
    /* describe("Mint, Accept, Cancel, Reject a Rejectable SBT", () => {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 15; // 15 minutes from now
      const contractMessage = "This is a sample contract message";
      const contractHash = ethers.utils.keccak256(utils.toUtf8Bytes(contractMessage));
      const expiry = Math.floor(Date.now() / 1000) + 60 * 17; // 17 minutes from now
  
      it("Sender can mint", async () => {
        // before minting, we have a balance of 0
        expect(await contractSigningSBT.balanceOf(sender.address)).to.be.equal(0);
        // Sender mints a new contract signature token
        console.log()
        const tx = await contractSigningSBT
          .connect(sender)
          .mint(
            receiver.address,
            deadline,
            expiry,
            contractHash
          );
  
        const receipt = await tx.wait();
        const tokenId = receipt.events[0].args.tokenId;
  
        //First token minted
        expect(tokenId).to.be.equal(0);
  
        // after minting, we have a balance of 0, because the receiver needs to accept
        expect(await contractSigningSBT.balanceOf(receiver.address)).to.be.equal(0);
        expect(await contractSigningSBT.ownerOf(tokenId)).to.be.equal(
          ethers.constants.AddressZero
        );
        // the receiver is the transferable owner
        expect(await contractSigningSBT.transferableOwnerOf(tokenId)).to.be.equal(
          receiver.address
        );
        // check the state of the token. 0 = minted, 1 = accepted, 2 = rejected, 3 = cancelled, 4 = expired
        expect(await contractSigningSBT.getState(tokenId)).to.be.equal(0);
      });
  
      it("Sender can cancel", async () => {
        // before minting, we have a balance of 0
        expect(await contractSigningSBT.balanceOf(sender.address)).to.be.equal(0);
        // Sender mints a new contract signature token
        const tx = await contractSigningSBT
          .connect(sender)
          .mint(
              receiver.address,
              deadline,
              expiry,
              contractHash
          );
  
        const receipt = await tx.wait();
        const tokenId = receipt.events[0].args.tokenId;
        //Second token minted
        expect(tokenId).to.be.equal(1);
  
        // after minting, we have a balance of 0, because the receiver needs to accept
        expect(await contractSigningSBT.balanceOf(receiver.address)).to.be.equal(0);
        expect(await contractSigningSBT.ownerOf(tokenId)).to.be.equal(
          ethers.constants.AddressZero
        );
        // the receiver is the transferable owner
        expect(await contractSigningSBT.transferableOwnerOf(tokenId)).to.be.equal(
          receiver.address
        );
  
        // the sender can cancel
        await contractSigningSBT.connect(sender).cancelTransfer(tokenId);
        // after cancelling, receiver continues having a balance of 0
        expect(await contractSigningSBT.balanceOf(receiver.address)).to.be.equal(0);
        expect(await contractSigningSBT.ownerOf(tokenId)).to.be.equal(
          ethers.constants.AddressZero
        );
        // the receiver is removed as transferable owner
        expect(await contractSigningSBT.transferableOwnerOf(tokenId)).to.be.equal(
          ethers.constants.AddressZero
        );
        // check the state of the token. 0 = minted, 1 = accepted, 2 = rejected, 3 = cancelled, 4 = expired
        expect(await contractSigningSBT.getState(tokenId)).to.be.equal(3);
      });
  
      it("Receiver can reject", async () => {
        // before minting, we have a balance of 0
        expect(await contractSigningSBT.balanceOf(sender.address)).to.be.equal(0);
  
        // Sender can define an incorrect contract hash
        const contractMessageIncorrect = "This is a sample contract message incorrect";
        const incorrectContractHash = ethers.utils.keccak256(utils.toUtf8Bytes(contractMessageIncorrect));
  
        // Sender mints a new contract signature token
        const tx = await contractSigningSBT
          .connect(sender)
          .mint(
              receiver.address,
              deadline,
              expiry,
              incorrectContractHash
          );
  
        const receipt = await tx.wait();
        const tokenId = receipt.events[0].args.tokenId;
        
        //Third token minted
        expect(tokenId).to.be.equal(2);
  
        // after minting, we have a balance of 0, because the receiver needs to accept
        expect(await contractSigningSBT.balanceOf(receiver.address)).to.be.equal(0);
        expect(await contractSigningSBT.ownerOf(tokenId)).to.be.equal(
          ethers.constants.AddressZero
        );
        // the receiver is the transferable owner
        expect(await contractSigningSBT.transferableOwnerOf(tokenId)).to.be.equal(
          receiver.address
        );
        // the receiver can check the contract hash and detect that it's incorrect
        const rejSBTContractHash = await contractSigningSBT.contractData(tokenId);
        // generate again contract hash
        const receiverContractHashGen = ethers.utils.keccak256(utils.toUtf8Bytes(contractMessage));
        expect(rejSBTContractHash.contractHash).to.not.be.equal(receiverContractHashGen);
  
        // the receiver can reject
        await contractSigningSBT.connect(receiver).rejectTransfer(tokenId);
        // after minting, we have a balance of 0, because the receiver needs to accept
        expect(await contractSigningSBT.balanceOf(receiver.address)).to.be.equal(0);
        expect(await contractSigningSBT.ownerOf(tokenId)).to.be.equal(
          ethers.constants.AddressZero
        );
        // the receiver is removed as transferable owner
        expect(await contractSigningSBT.transferableOwnerOf(tokenId)).to.be.equal(
          ethers.constants.AddressZero
        );
        // check the state of the token. 0 = minted, 1 = accepted, 2 = rejected, 3 = cancelled, 4 = expired
        expect(await contractSigningSBT.getState(tokenId)).to.be.equal(2);
      });
  
      it("Receiver can accept transfer", async () => {
        // before minting, we have a balance of 0
        expect(await contractSigningSBT.balanceOf(sender.address)).to.be.equal(0);
        // Sender mints a new contract signature token
        const tx = await contractSigningSBT
          .connect(sender)
          .mint(
              receiver.address,
              deadline,
              expiry,
              contractHash
          );
  
        const receipt = await tx.wait();
        const tokenId = receipt.events[0].args.tokenId;
        //Fourth token minted
        expect(tokenId).to.be.equal(3);
  
        // after minting, we have a balance of 0, because the receiver needs to accept
        expect(await contractSigningSBT.balanceOf(receiver.address)).to.be.equal(0);
        expect(await contractSigningSBT.ownerOf(tokenId)).to.be.equal(
          ethers.constants.AddressZero
        );
        // the receiver is the transferable owner
        expect(await contractSigningSBT.transferableOwnerOf(tokenId)).to.be.equal(
          receiver.address
        );
  
        // the receiver can accept
        await contractSigningSBT.connect(receiver).acceptTransfer(tokenId);
        // after minting, we have a balance of 1
        expect(await contractSigningSBT.balanceOf(receiver.address)).to.be.equal(1);
        expect(await contractSigningSBT.ownerOf(tokenId)).to.be.equal(
          receiver.address
        );
        // the receiver is removed as transferable owner
        expect(await contractSigningSBT.transferableOwnerOf(tokenId)).to.be.equal(
          ethers.constants.AddressZero
        );
        // check the state of the token. 0 = minted, 1 = accepted, 2 = rejected, 3 = cancelled, 4 = expired
        expect(await contractSigningSBT.getState(tokenId)).to.be.equal(1);
      });
    }); */
});
