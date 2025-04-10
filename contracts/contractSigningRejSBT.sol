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
        Expired
    }

    struct ContractData {
        //Hash of the contract
        string contractHash;
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
        string memory contractHash_
    ) public returns (uint256) {
        require(
            (keccak256(abi.encodePacked(contractHash_)) !=
                keccak256(abi.encodePacked(""))),
            "ContractSigning_SBT: contract hash is empty"
        );

        require(
            deadline_ > block.timestamp,
            "ContractSigning_SBT: incorrect deadline value"
        );

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;
        _mint(to, tokenId, deadline_);

        contractData[tokenId] = ContractData({
            contractHash: contractHash_,
            deadline: deadline_
        });

        return tokenId;
    }

    function getState(uint256 tokenId) public view virtual returns (IBEState) {
        _requireMinted(tokenId);
        if (_states[tokenId] == State.Accepted) {
                return IBEState.Accepted;
        } else if (_deadlines[tokenId] < block.timestamp) {
            return IBEState.Expired;
        }
        return IBEState.Minted;
    }
}