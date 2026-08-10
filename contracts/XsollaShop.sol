// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./XsollaItems.sol";

/**
 * @title XsollaShop
 * @notice Video-game item shop. Purchases are payable in XSOLLA only.
 *         Listings are organized by video game (browse games → items).
 */
contract XsollaShop is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable xsolla;
    XsollaItems public immutable items;
    address public paymentRecipient;

    struct Listing {
        uint256 priceXsolla; // 18-decimal XSOLLA wei
        bool active;
        string name;
        string metadataURI;
        string game; // e.g. "Texas Hold'em", "Blackjack"
    }

    mapping(uint256 => Listing) public listings;
    uint256 public nextItemId = 1;

    event ItemListed(
        uint256 indexed itemId,
        uint256 priceXsolla,
        string name,
        string metadataURI,
        string game
    );
    event ItemUpdated(uint256 indexed itemId, uint256 priceXsolla, bool active);
    event ItemPurchased(
        address indexed buyer,
        uint256 indexed itemId,
        uint256 quantity,
        uint256 totalPaid
    );
    event PaymentRecipientUpdated(address indexed recipient);

    constructor(address xsollaToken, address itemsContract, address recipient) {
        require(xsollaToken != address(0), "Invalid XSOLLA");
        require(itemsContract != address(0), "Invalid items");
        xsolla = IERC20(xsollaToken);
        items = XsollaItems(itemsContract);
        paymentRecipient = recipient == address(0) ? msg.sender : recipient;
    }

    function setPaymentRecipient(address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        paymentRecipient = recipient;
        emit PaymentRecipientUpdated(recipient);
    }

    function listItem(
        uint256 priceXsolla,
        string calldata name_,
        string calldata metadataURI,
        string calldata game_
    ) external onlyOwner returns (uint256 itemId) {
        require(priceXsolla > 0, "Invalid price");
        require(bytes(name_).length > 0, "Invalid name");
        require(bytes(game_).length > 0, "Invalid game");
        itemId = nextItemId++;
        listings[itemId] = Listing({
            priceXsolla: priceXsolla,
            active: true,
            name: name_,
            metadataURI: metadataURI,
            game: game_
        });
        items.setTokenURI(itemId, metadataURI);
        emit ItemListed(itemId, priceXsolla, name_, metadataURI, game_);
    }

    function updateItem(
        uint256 itemId,
        uint256 priceXsolla,
        bool active,
        string calldata name_,
        string calldata metadataURI,
        string calldata game_
    ) external onlyOwner {
        Listing storage listing = listings[itemId];
        require(bytes(listing.name).length > 0 || listing.priceXsolla > 0, "Unknown item");
        require(priceXsolla > 0, "Invalid price");
        require(bytes(game_).length > 0, "Invalid game");
        listing.priceXsolla = priceXsolla;
        listing.active = active;
        listing.name = name_;
        listing.metadataURI = metadataURI;
        listing.game = game_;
        items.setTokenURI(itemId, metadataURI);
        emit ItemUpdated(itemId, priceXsolla, active);
    }

    function getListing(uint256 itemId)
        external
        view
        returns (
            uint256 priceXsolla,
            bool active,
            string memory name_,
            string memory metadataURI,
            string memory game_
        )
    {
        Listing storage listing = listings[itemId];
        return (
            listing.priceXsolla,
            listing.active,
            listing.name,
            listing.metadataURI,
            listing.game
        );
    }

    /// @notice Buy `quantity` of `itemId` paying only in XSOLLA.
    function buy(uint256 itemId, uint256 quantity) external nonReentrant {
        require(quantity > 0, "Zero quantity");
        Listing storage listing = listings[itemId];
        require(listing.active, "Item not for sale");
        require(listing.priceXsolla > 0, "Invalid listing");

        uint256 total = listing.priceXsolla * quantity;
        require(total / quantity == listing.priceXsolla, "Overflow");

        xsolla.safeTransferFrom(msg.sender, paymentRecipient, total);
        items.mint(msg.sender, itemId, quantity, "");

        emit ItemPurchased(msg.sender, itemId, quantity, total);
    }
}
