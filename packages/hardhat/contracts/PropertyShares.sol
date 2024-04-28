







// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/// @title PropertyShares contract for selling shares in a property
/// @author Temitope O. Hassan
/// @notice This contract allows property owners to sell shares in their property to investors
/// @dev This contract is written in Solidity version 0.8.0

import "./PropertyNFT.sol";

contract PropertyShares {
    PropertyNFT public nftContract; // Reference to the NFT contract

    // Constructor to set the NFT contract address
    constructor(address _nftContract) {
        nftContract = PropertyNFT(_nftContract);
    }

    event PropertyCreated(address indexed owner, uint256 indexed propertyId, string name, uint256 totalShares, uint256 sharePrice);
    event ShareBought(address indexed buyer, uint256 indexed propertyId, uint256 shareId, uint256 sharePrice, uint256 newTokenId); // Updated event signature

    struct Share {
        uint256 shareId;
        bool isSold;
        uint256 propertyId;
        uint256 price;
        address owner;
    }

    struct Property {
        uint256 propertyId;
        address payable owner;
        string name;
        uint256 totalShares;
        uint256 sharePrice;
        uint256 sharesSold;
        string image;
        mapping(uint256 => Share) shares;
    }

    mapping(uint256 => Property) public properties;
    uint256 public numProperties;
    uint256 public sharesCounter = 0;

    function createProperty(string memory _name, uint256 _totalShares, uint256 _sharePrice, string memory _image) external {
        Property storage newProperty = properties[numProperties];
        newProperty.propertyId = numProperties;
        newProperty.owner = payable(msg.sender);
        newProperty.name = _name;
        newProperty.totalShares = _totalShares;
        newProperty.sharePrice = _sharePrice;
        newProperty.image = _image;
        emit PropertyCreated(msg.sender, newProperty.propertyId, _name, _totalShares, _sharePrice);
        numProperties++;
    }

    function buyShare(uint256 _propertyId, string memory _tokenURI) external payable {
        Property storage property = properties[_propertyId];
        require(property.owner != address(0), "Property does not exist");
        require(!propertyIsSoldOut(property), "All shares are sold out");
        require(msg.value >= property.sharePrice, "Insufficient funds");

        uint256 shareId = getAvailableShareId(property);
        require(shareId != type(uint256).max, "No available shares");

        Share storage share = property.shares[shareId];
        share.isSold = true;
        share.owner = payable(msg.sender);
        property.sharesSold++;

        address payable propOwner = payable(property.owner);
        propOwner.transfer(msg.value); // Transfer funds to property owner

        // Mint an NFT and send it to the buyer
        uint256 newTokenId = nftContract.mintNFT(msg.sender, _tokenURI); // Mint NFT and get the new token ID

        emit ShareBought(msg.sender, _propertyId, shareId, property.sharePrice, newTokenId); // Emit newTokenId in the event
    }

    function propertyIsSoldOut(Property storage _property) internal view returns (bool) {
        return _property.sharesSold >= _property.totalShares;
    }

    function getAvailableShareId(Property storage _property) internal view returns (uint256) {
        for (uint256 i = 0; i < _property.totalShares; i++) {
            if (!_property.shares[i].isSold) {
                return i;
            }
        }
        return type(uint256).max;
    }

    function getPropertyShares(uint256 _propertyId) external view returns (Share[] memory) {
        Property storage property = properties[_propertyId];
        Share[] memory result = new Share[](property.totalShares);
        for (uint256 i = 0; i < property.totalShares; i++) {
            result[i] = property.shares[i];
        }
        return result;
    }
}
