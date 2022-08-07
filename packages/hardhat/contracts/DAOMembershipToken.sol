// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// NOTE: accounts have a distinct balance for each token id, and non-fungible tokens are implemented by simply minting a single one of them
//       -> https://docs.openzeppelin.com/contracts/3.x/erc1155#multi-token-standard

contract DAOMembershipToken is
    ERC1155,
    Ownable,
    Pausable,
    ERC1155Supply
{
    uint256 public constant ERC20_REPUTATION_TOKEN_ID = 0;

    uint256 public totalNFTSupply = 0;

    mapping(uint256 => address) public tokenIdToOwner;
    mapping(address => bool) public isNFTHolder;

    uint256[] _reputationLevels;
    string[] _reputationLevelBaseUris;


    constructor(
        uint256[] memory initialReputationLevels,
        string[] memory initialReputationLevelBaseUris
    ) ERC1155("") {
        updateReputationLevels(initialReputationLevels, initialReputationLevelBaseUris);
    }


    function updateReputationLevels(
        uint256[] memory newReputationLevels,
        string[] memory newReputationLevelBaseUris
    )
        public
        onlyOwner
    {
        require(newReputationLevels.length == newReputationLevelBaseUris.length, "Reputation levels and reputation level baseUris differ in length.");
        _reputationLevels = newReputationLevels;
        _reputationLevelBaseUris = newReputationLevelBaseUris;
    }

    function reputationLevels()
        public
        view
        returns (uint256[] memory)
    {
        return _reputationLevels;
    }

    function reputationLevelBaseUris()
        public
        view
        returns (string[] memory)
    {
        return _reputationLevelBaseUris;
    }

    function reputationLevelsCount()
        public
        view
        returns (uint256)
    {
        return _reputationLevels.length;
    }

    function getReputationLevelByIndex(uint256 index)
        public
        view
        returns (uint256)
    {
        require(index < _reputationLevels.length, "Reputation level does not exist (out of bounds).");
        return _reputationLevels[index];
    }

    function getReputationLevelBaseUriByIndex(uint256 index)
        public
        view
        returns (string memory)
    {
        require(index < _reputationLevelBaseUris.length, "Reputation level baseUri does not exist (out of bounds).");
        return _reputationLevelBaseUris[index];
    }

    // TODO: add onlyOwner modifier
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    )
        public
    {
        // id 0 is erc20 reputation token, all other tokens are nfts
        if (id != ERC20_REPUTATION_TOKEN_ID) {
            // beside reputation token only nfts allowed
            require(amount == 1, "Amount of non reputation token needs to equal 1.");
            require(totalSupply(id) == 0, "Supply of non reputation token needs to equal 0.");
            totalNFTSupply++;
        }

        if (id == ERC20_REPUTATION_TOKEN_ID) {
            bool ownsNFT = isNFTHolder[to];
            require(ownsNFT, "Reputation tokens can only be transfered to nft holders.");
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
        onlyOwner
    {
        for (uint256 i = 0; i < ids.length; ++i) {
            // id 0 is erc20 reputation token, all other tokens are nfts
            if (ids[i] != ERC20_REPUTATION_TOKEN_ID) {
                // beside reputation token only nfts allowed
                require(amounts[i] == 1, "Amount of non reputation token needs to equal 1.");
                require(totalSupply(ids[i]) == 0, "Supply of non reputation token needs to equal 0.");
                totalNFTSupply++;
            }
        }

        _mintBatch(to, ids, amounts, data);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
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
        // not mint
        if (from != address(0)) {
            // only reputation tokens are transferable
            require(ids.length == 1, "Only reputation tokens are transferable.");
            require(ids[0] == ERC20_REPUTATION_TOKEN_ID, "Only reputation tokens are transferable.");
        }

        for (uint256 i = 0; i < ids.length; ++i) {
            if (ids[i] != ERC20_REPUTATION_TOKEN_ID) {
                tokenIdToOwner[ids[i]] = to;
                isNFTHolder[from] = false;
                isNFTHolder[to] = true;
            }
        }

        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function uri(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(tokenId != ERC20_REPUTATION_TOKEN_ID, "Reputation token has no uri.");

        address tokenOwner = tokenIdToOwner[tokenId];
        uint256 ownerReputationBalance = balanceOf(tokenOwner, ERC20_REPUTATION_TOKEN_ID);

        for (uint256 i = 0; i < _reputationLevels.length - 1; ++i) {
            if (
                _reputationLevels[i] >= ownerReputationBalance &&
                _reputationLevels[i] <= _reputationLevels[i+1]
            ) {
                string memory baseUri = _reputationLevelBaseUris[i];
                 // TODO: maybe only return reputationLevel_Uri ?
                return string(abi.encodePacked(baseUri, Strings.toString(tokenId)));
            }
        }

        if (ownerReputationBalance > _reputationLevels[_reputationLevels.length]) {
            string memory baseUri = _reputationLevelBaseUris[_reputationLevelBaseUris.length - 1];
            // TODO: maybe only return reputationLevel_Uri ?
            return string(abi.encodePacked(baseUri, Strings.toString(tokenId)));
        }
    }

}
