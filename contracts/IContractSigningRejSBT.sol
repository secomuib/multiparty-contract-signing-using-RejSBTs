// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IContractSingnigRejSBT {
    enum IBEState {
        Minted,
        Accepted,
        Rejected,
        Cancelled,
        Expired
    }

    function mint(
        address to,
        uint256 deadline_,
        uint256 expiry_,
        string memory contractHash_
    ) external returns (uint256);

    function getState(uint256 tokenId) external view returns (IBEState);
}