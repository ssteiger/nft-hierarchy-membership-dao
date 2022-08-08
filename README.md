# NFT Hierarchy Membership DAO

An Ethereum DAO where:
* memberships are tracked through non-transferable ERC1155 NFTs (eg. [soulbound tokens](https://vitalik.ca/general/2022/01/26/soulbound.html))
* membership levels/ranks are tracked via an ERC20 reputation token
* membership levels/ranks are part of the NFT

![nft_hierarchy_membership dao_screenshot_01](./packages/react-app/public/nft_hierarchy_membership_dao_screenshot_01.png?raw=true 'Minimal_DAO_01')

## Setup

```bash
# install dependencies
$ yarn

# 1. Terminal
# start local chain
$ yarn chain

# 2. Terminal
# deploy contracts
$ yarn deploy

# start app on localhost:3000
$ yarn start
```

## Possible implementations

There are two possible ways of implementing something like this:

### 1. Visual

`tokenUri()` returns a different image depending on the amount of reputation tokens the NFT holder owns:

```javascript
function tokenUri(uint265 _token) {
  address tokenOwner = tokenToAddressMap(_token) // NOTE: this is not part of the erc1155 standard -> needs to be implemented
  uint256 userRepBalance = balance(tokenOwner, repTokenId)

  if (userRepBalance < 1) return 'ipfs://image01'
  if (userRepBalance < 100) return 'ipfs://image02'
  if (userRepBalance < 500) return 'ipfs://image03'
  if (userRepBalance < 1000) return 'ipfs://image04'
  return 'ipfs://image05'
}
```

NOTE: Most wallets and NFT websites only fetch the image of a NFT at mint time (listening for mint events) and require manual interaction to update cached images.

This means that with this strategy, the membership level representation may not be correct/up-to-date across all platforms at all times.

An example smart contract implementation can be found [here](./packages/hardhat/contracts/DAOMembershipToken.sol).

### 2. Using `mint()` or `burn()`

The call of `mint()` or `burn()` checks how many reputation tokens the NFT holder owns and mints a new NFT if the required threshold is met and burns the old NFT.

```javascript
function burn(uint265 _nftToken) {
  address tokenOwner = tokenToAddressMap(_nftToken)
  uint256 userRepBalance = balance(tokenOwner, repTokenId)

  if (userRepBalance >= 100) {
      _burn(_nftToken)
      _mint(nextLevelNFTToken)
  }
}
```

## NFT hierarchies

The differentiation between the NFT hierarchies can be achieved in one of the following ways:

### 1. Deploying one NFT contract and using tokenId ranges for the hierarchies

```javascript
const uint256_MAX_VALUE = 57896044618658097711785492504343953926634992332820282019728792003956564819967

mapping(bytes32 => uint256) levelTokenSupply

const levelRanges = [
  (0 to 100000 => keccak256('LEVEL_1')),
  (100001 to 200000 => keccak256('LEVEL_2')),
  (200001 to 300000 => keccak256('LEVEL_3')),
  (300001 to 400000 => keccak256('LEVEL_4')),
  (400001 to 500000 => keccak256('LEVEL_5')),
  ...
]

function burn(uint265 _nftToken) {
  address tokenOwner = tokenToAddressMap(_nftToken)
  uint256 userRepBalance = balance(tokenOwner, repTokenId)

  nextLevel = fetchNextLevel(currentLevel, userRepBalance, levelRanges)
  currentLevelTokenSupply = levelTokenSupply[nextLevel]
  nextLevelNFTToken = currentLevelTokenSupply + 1

  if (nextLevel != currentLevel) {
      _burn(_nftToken)
      _mint(nextLevelNFTToken)
  }
}
```

### 2. Deploying a new NFT contract for each hierarchy + `mint()` or `burn()` strategy

and minting the next NFT level through:
  1. burning the lower level NFT

  or

  2. burning reputation tokens

## Example implementation

This repository contains an example implementation of design option `1. Visual`.

![nft_hierarchy_membership dao_screenshot_01](./packages/react-app/public/nft_hierarchy_membership_dao_screenshot_01.png?raw=true 'Minimal_DAO_01')

* [smart contract](./packages/hardhat/contracts/DAOMembershipToken.sol)

## License

MIT
