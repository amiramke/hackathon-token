pragma solidity ^0.4.23;

import "../tokens/NFTokenMetadata.sol";
import "@0xcert/ethereum-utils/contracts/ownership/Ownable.sol";
import "@0xcert/ethereum-utils/contracts/math/SafeMath.sol";

contract TRRToken is
  NFTokenMetadata,
  Ownable
{
  using SafeMath for uint256;
  /**
   * @dev Mapping from NFT ID to product price
   */
  mapping (uint256 => uint256) internal idToPrice;

  constructor(
    string _name,
    string _symbol
  )
    public
  {
    nftName = _name;
    nftSymbol = _symbol;
  }

  function mint(
    address _owner,
    uint256 _id
  )
    onlyOwner
    external
  {
    super._mint(_owner, _id);
  }

  function burn(
    address _owner,
    uint256 _tokenId
  )
    onlyOwner
    external
  {
    super._burn(_owner, _tokenId);
  }

  /**
   * @dev Set a Price for a token / product that when buyer pays that price, they get the token
   * @notice this is a internal function which should be called from user-implemented external
   * function. Its purpose is to show and properly initialize data structures when using this
   * implementation.
   * @param _tokenId Id for which we want uri.
   * @param _price uint256
   */
  function setTokenPrice (
    uint256 _tokenId,
    uint256 _price
  )
    validNFToken(_tokenId)
    onlyOwner
    external
  {
    idToPrice[_tokenId] = _price;
  }

  function buy(uint256 _tokenId)
  payable
  external {
    address consignor = idToOwner[_tokenId];
    uint256 price = idToPrice[_tokenId];

    require(price <= msg.value);

    _transfer(msg.sender, _tokenId);
    uint256 commission = 60;
    consignor.transfer(price * commission / 100);
    owner.transfer(price * ( 100 - commission) / 100);
  }
}