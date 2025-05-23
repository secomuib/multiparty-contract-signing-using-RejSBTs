import { waffle } from "hardhat";
import "@nomiclabs/hardhat-waffle";
import { Contract, utils } from "ethers";
import { ethers } from "hardhat";
import chai from "chai";

chai.use(waffle.solidity);
const { expect } = chai;

const contractSBT_NAME = "Contract signing SBT";
const contractSBT_SYMBOL = "CS-SBT";

describe("Contract signing using RejSBT", () => {
  let contractSigningSBT: Contract;
  let multiSigWallet: Contract;

  let deployer: any, signer1: any, signer2: any, signer3: any;

  before(async () => {
    [deployer, signer1, signer2, signer3] = await ethers.getSigners();
    
    const multiSigWalletOwners = [
      deployer.address,
      signer1.address,
      signer2.address,
      signer3.address,
    ];

    //Deployer user deploys the multiSigWallet
    const multiSigWalletContractSigning = await ethers.getContractFactory(
      "multiSigWalletContractSigning"
    );
    //Deployer user deploys the multisign wallet smart contract
    multiSigWallet = await multiSigWalletContractSigning
      .connect(deployer)
      .deploy(multiSigWalletOwners);

    const contractSigningRSBT = await ethers.getContractFactory(
      "contractSigningRejSBT"
    );
    //Deployer user deploys the contractSigningRejSBT smart contract
    contractSigningSBT = await contractSigningRSBT
      .connect(deployer)
      .deploy(contractSBT_NAME, contractSBT_SYMBOL);
  });

  /**
   * Deployment
   */
  describe("Deployment", () => {
    it("MultiSign wallet: Contracts deployed successfully", async () => {
      expect(multiSigWallet.address).to.not.be.undefined;
    });

    it("MultiSign wallet: check owners", async () => {
      expect(await multiSigWallet.isOwner(signer1.address)).to.be.equal(true);
      expect(await multiSigWallet.isOwner(signer2.address)).to.be.equal(true);
      expect(await multiSigWallet.isOwner(signer3.address)).to.be.equal(true);
    });

    it("Contracts deployed successfully", async () => {
      expect(contractSigningSBT.address).to.not.be.undefined;
    });

    it("Check name and symbol", async () => {
      expect(await contractSigningSBT.name()).to.be.equal(contractSBT_NAME);
      expect(await contractSigningSBT.symbol()).to.be.equal(contractSBT_SYMBOL);
    });
  });

  /**
   * Mint, Accept a Contract signature SBT
   */
  describe("Contract sign proposal, mint, Accept a Rejectable SBT", () => {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 15; // 15 minutes from now
    const contractMessage = "This is a sample contract message";
    const contractHash = ethers.utils.keccak256(
      utils.toUtf8Bytes(contractMessage)
    );

    it("Proposer can propose a new signature mint", async () => {
      // before minting, we have a balance of 0
      expect(
        await contractSigningSBT.balanceOf(multiSigWallet.address)
      ).to.be.equal(0);
      // PS proposes the mint of a new contract signature token
      const tx = await contractSigningSBT
        .connect(deployer)
        .mint(multiSigWallet.address, deadline, contractHash);

      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args.tokenId;

      //First token proposed
      expect(tokenId).to.be.equal(0);

      // after minting (propose), we have a balance of 0, because it's needed the acceptance from the multiSignWallet
      expect(
        await contractSigningSBT.balanceOf(multiSigWallet.address)
      ).to.be.equal(0);
      expect(await contractSigningSBT.ownerOf(tokenId)).to.be.equal(
        ethers.constants.AddressZero
      );
      // the multiSigWallet is the transferable owner
      expect(await contractSigningSBT.transferableOwnerOf(tokenId)).to.be.equal(
        multiSigWallet.address
      );
      // check the state of the token. 0 = proposed, 1 = accepted, 2 = expired
      expect(await contractSigningSBT.getState(tokenId)).to.be.equal(0);
    });

    it("Multisign wallet owner can submit and approveTransaction to multiSignWallet", async () => {
      // before minting, we have a balance of 0
      expect(
        await contractSigningSBT.balanceOf(multiSigWallet.address)
      ).to.be.equal(0);

      const tokenId = 0;

      // Owner defines the data to submit the transaction
      const data = contractSigningSBT.interface.encodeFunctionData(
        "acceptTransfer",
        [tokenId]
      );
      // Proposer submits and approves transaction to accept new contract signature proposal
      console.log( 
        await multiSigWallet
        .connect(signer1)
        .submitTransactionWithSignerApproval(
          contractSigningSBT.address,
          tokenId,
          data
        )
      )
      const tx = await multiSigWallet.transactions(0);

      // Check the transaction has been submitted and has the first approval
      expect(tx).to.not.be.undefined;
      expect(tx.to).to.be.equal(contractSigningSBT.address);
      expect(tx.data).to.be.equal(data);
      expect(tx.executed).to.be.equal(false);
      expect(tx.numApprovals).to.be.equal(1);
    });

    it("Owners can approveTransaction to multiSigWallet", async () => {
      // Owner1 approves transaction to accept new contract signature proposal
      await multiSigWallet.connect(signer2).approveTransaction(0);

      let tx = await multiSigWallet.transactions(0);

      // Check the transaction state after approval
      expect(tx).to.not.be.undefined;
      expect(tx.to).to.be.equal(contractSigningSBT.address);
      expect(tx.executed).to.be.equal(false);
      expect(tx.numApprovals).to.be.equal(2);
    });

    it("Missing owner can approves and execute transaction to multiSigWallet", async () => {
      // Missing owner approves and executes transaction to accept new contract signature proposal
      await multiSigWallet.connect(signer3).approveAndExecuteTransaction(0);

      const tx = await multiSigWallet.transactions(0);

      // Check the transaction state after last approval
      expect(tx).to.not.be.undefined;
      expect(tx.to).to.be.equal(contractSigningSBT.address);
      expect(tx.executed).to.be.equal(true);
      expect(tx.numApprovals).to.be.equal(3);

      // Check minting of the rejSBT, after execute transaction we have a balance of 1
      expect(
        await contractSigningSBT.balanceOf(multiSigWallet.address)
      ).to.be.equal(1);
    });

    it("In case signer doesn't approves the transaction, the transaction should not be executed", async () => {
      // before minting a new contract signature, we have a balance of 1
      expect(
        await contractSigningSBT.balanceOf(multiSigWallet.address)
      ).to.be.equal(1);

      // Proposer mints a new contract signature token
      const tx = await contractSigningSBT
        .connect(deployer)
        .mint(multiSigWallet.address, deadline, contractHash);

      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args.tokenId;

      //First token minted
      expect(tokenId).to.be.equal(1);

      // after minting proposal, we have a balance of 1, because it's needed the acceptance from the multiSigWallet
      expect(
        await contractSigningSBT.balanceOf(multiSigWallet.address)
      ).to.be.equal(1);
      expect(await contractSigningSBT.ownerOf(tokenId)).to.be.equal(
        ethers.constants.AddressZero
      );
      // the multiSigWallet is the transferable owner
      expect(await contractSigningSBT.transferableOwnerOf(tokenId)).to.be.equal(
        multiSigWallet.address
      );
      // check the state of the token. 0 = minted, 1 = accepted, 2 = expired
      expect(await contractSigningSBT.getState(tokenId)).to.be.equal(0);

      // Owner defines the data to submit the transaction
      const data = contractSigningSBT.interface.encodeFunctionData(
        "acceptTransfer",
        [1]
      );

      // Proposer submits and approves transaction to accept new contract signature proposal
      await multiSigWallet
        .connect(signer1)
        .submitTransactionWithSignerApproval(
          contractSigningSBT.address,
          tokenId,
          data
        );
      const submitTransaction = await multiSigWallet.transactions(1);

      // Check the transaction has been submitted
      expect(submitTransaction).to.not.be.undefined;
      expect(submitTransaction.to).to.be.equal(contractSigningSBT.address);
      expect(submitTransaction.data).to.be.equal(data);
      expect(submitTransaction.executed).to.be.equal(false);
      expect(submitTransaction.numApprovals).to.be.equal(1);

      
      // Last owner can't execute transaction
      // Last owner approves and executes transaction to accept new contract signature proposal
      await expect(
        multiSigWallet.connect(signer3).approveAndExecuteTransaction(1)
      ).to.be.revertedWith("All owners must approve the transaction");
    });
  });

  describe("Contract sign proposal expired", () => {
    const deadline = Math.floor(Date.now() / 1000) + 30; // 30 seconds from now
    const contractMessage = "This is a sample contract message";
    const contractHash = ethers.utils.keccak256(
      utils.toUtf8Bytes(contractMessage)
    );

    it("Proposer can propose a new signature mint", async () => {
      // before minting, we have a balance of 1
      expect(
        await contractSigningSBT.balanceOf(multiSigWallet.address)
      ).to.be.equal(1);
      // Sender mints a new contract signature token
      const tx = await contractSigningSBT
        .connect(deployer)
        .mint(multiSigWallet.address, deadline, contractHash);

      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args.tokenId;

      //One token already minted
      expect(tokenId).to.be.equal(2);

      // after minting, we have a balance of 1, because it's needed the acceptance from the multiSignWallet
      expect(
        await contractSigningSBT.balanceOf(multiSigWallet.address)
      ).to.be.equal(1);
      expect(await contractSigningSBT.ownerOf(tokenId)).to.be.equal(
        ethers.constants.AddressZero
      );
      // the multiSigWallet is the transferable owner
      expect(await contractSigningSBT.transferableOwnerOf(tokenId)).to.be.equal(
        multiSigWallet.address
      );
      // check the state of the token. 0 = minted, 1 = accepted, 2 = expired
      expect(await contractSigningSBT.getState(tokenId)).to.be.equal(0);
    });

    it("Proposer can submit and approveTransaction to multiSignWallet", async () => {
      // before minting, we have a balance of 1
      expect(
        await contractSigningSBT.balanceOf(multiSigWallet.address)
      ).to.be.equal(1);
      const tokenId = 2;
      // Owner defines the data to submit the transaction
      const data = contractSigningSBT.interface.encodeFunctionData(
        "acceptTransfer",
        [tokenId]
      );

      // Wait until the deadline expires
      await new Promise((resolve) => setTimeout(resolve, 35 * 1000));

      // Proposer submits and approves transaction to accept new contract signature proposal
      const tx = multiSigWallet
        .connect(signer1)
        .submitTransactionWithSignerApproval(
          contractSigningSBT.address,
          tokenId,
          data
        );

      await expect(tx).to.be.revertedWith(
        "Contract signature proposal deadline expired"
      );
    });
  });
});
