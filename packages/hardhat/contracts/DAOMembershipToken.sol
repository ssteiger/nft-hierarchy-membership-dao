// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract DAOMembershipToken is ERC1155, AccessControl, Pausable, ERC1155Burnable, ERC1155Supply {
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC1155("https://my-dao.com") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function setURI(
        string memory newuri
    )
        public
        onlyRole(URI_SETTER_ROLE)
    {
        _setURI(newuri);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    )
        public
        onlyRole(MINTER_ROLE)
    {
        // id 0 is erc20 reputation token
        if (id != 0) {
            // all other ids are nfts
            require(amount == 1);
            require(totalSupply(id) == 0);
        }

        _mint(to, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        public
        onlyRole(MINTER_ROLE)
    {
        for (uint256 i = 0; i < ids.length; i++) {
            // id 0 is erc20 reputation token
            if (ids[i] != 0) {
                // all other ids are nfts
                require(amounts[i] == 1);
                require(totalSupply(ids[i]) == 0);
            }
        }

        _mintBatch(to, ids, amounts, data);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        internal
        whenNotPaused
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
