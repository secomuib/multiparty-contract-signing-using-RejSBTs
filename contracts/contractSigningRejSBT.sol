// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SBT/RejectableSBTDeadline.sol";

/// @title Test rejectable SBT with IBE parameters and deadline
/// @notice Soulbound token test contract
contract contractSigningRejSBT is RejectableSBTDeadline {

    uint256 private _tokenIdCounter;

    enum IBEState {
        Minted,
        Accepted,
        Rejected,
        Cancelled,
        Expired
    }

    struct ContractData {
        //Hash of the contract
        string contractHash;
        //Expiry date in unix time
        uint256 expiry;
        //Deadline in unix time
        uint256 deadline;
    }

    // Mapping from token ID to message data
    mapping(uint256 => ContractData) public contractData;

    constructor(string memory name_, string memory symbol_)
        RejectableSBTDeadline(name_, symbol_)
        Ownable(msg.sender)
    {}

    function mint(
        address to,
        uint256 deadline_,
        uint256 expiry_,
        string memory contractHash_
    ) public returns (uint256) {
        require(
            (keccak256(abi.encodePacked(contractHash_)) !=
                keccak256(abi.encodePacked(""))),
            "ContractSigning_SBT: contract hash is empty"
        );

        require(
            expiry_ != 0 && expiry_ > deadline_ && deadline_ > block.timestamp,
            "ContractSigning_SBT: incorrect expiry date or deadline value"
        );

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;
        _mint(to, tokenId, deadline_);

        contractData[tokenId] = ContractData({
            contractHash: contractHash_,
            expiry: expiry_,
            deadline: deadline_
        });

        return tokenId;
    }

    function getState(uint256 tokenId) public view virtual returns (IBEState) {
        _requireMinted(tokenId);
        if (_states[tokenId] == State.Accepted) {
            if (
                contractData[tokenId].expiry != 0 &&
                contractData[tokenId].expiry < block.timestamp
            ) {
                return IBEState.Expired;
            } else {
                return IBEState.Accepted;
            }
        } else if (_deadlines[tokenId] < block.timestamp) {
            return IBEState.Expired;
        }
        return IBEState.Minted;
    }
}