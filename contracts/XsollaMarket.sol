// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./XsollaShop.sol";
import "./XsollaItems.sol";

/**
 * @title XsollaMarket
 * @notice Secondary market for XSITEM. Royalty from shop listing + Verse fee.
 *         Market License holders pay a reduced fee.
 */
contract XsollaMarket is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable xsolla;
    IERC1155 public immutable items;
    XsollaItems public immutable xsItems;
    XsollaShop public immutable shop;
    address public feeRecipient;
    uint16 public feeBps;
    uint16 public licenseFeeBps;
    uint256 public licenseItemId;
    address public stakeView;
    uint256 public nextOfferId = 1;

    struct Offer {
        address seller;
        uint256 itemId;
        uint256 quantity;
        uint256 priceXsolla;
        bool active;
    }

    mapping(uint256 => Offer) public offers;

    event OfferListed(
        uint256 indexed offerId,
        address indexed seller,
        uint256 indexed itemId,
        uint256 quantity,
        uint256 priceXsolla
    );
    event OfferCancelled(uint256 indexed offerId);
    event OfferSold(
        uint256 indexed offerId,
        address indexed buyer,
        address indexed studio,
        uint256 itemId,
        uint256 quantity,
        uint256 studioPaid,
        uint256 versePaid,
        uint256 sellerPaid
    );
    event FeesUpdated(uint16 feeBps, uint16 licenseFeeBps, uint256 licenseItemId);

    constructor(
        address xsollaToken,
        address itemsContract,
        address shopContract,
        address feeRecipient_,
        uint256 licenseItemId_
    ) {
        require(xsollaToken != address(0) && itemsContract != address(0), "Invalid");
        require(shopContract != address(0), "Invalid shop");
        xsolla = IERC20(xsollaToken);
        items = IERC1155(itemsContract);
        xsItems = XsollaItems(itemsContract);
        shop = XsollaShop(shopContract);
        feeRecipient = feeRecipient_ == address(0) ? msg.sender : feeRecipient_;
        feeBps = 250;
        licenseFeeBps = 100;
        licenseItemId = licenseItemId_;
    }

    function setFees(
        uint16 feeBps_,
        uint16 licenseFeeBps_,
        uint256 licenseItemId_,
        address feeRecipient_
    ) external onlyOwner {
        require(feeBps_ <= 1000 && licenseFeeBps_ <= feeBps_, "Invalid fee");
        require(feeRecipient_ != address(0), "Invalid recipient");
        feeBps = feeBps_;
        licenseFeeBps = licenseFeeBps_;
        licenseItemId = licenseItemId_;
        feeRecipient = feeRecipient_;
        emit FeesUpdated(feeBps_, licenseFeeBps_, licenseItemId_);
    }

    function setStakeView(address stakeView_) external onlyOwner {
        stakeView = stakeView_;
    }

    function list(
        uint256 itemId,
        uint256 quantity,
        uint256 priceXsolla
    ) external nonReentrant returns (uint256 offerId) {
        require(quantity > 0 && priceXsolla > 0, "Invalid offer");
        require(!xsItems.soulbound(itemId), "Soulbound");
        require(items.balanceOf(msg.sender, itemId) >= quantity, "Not enough");
        require(items.isApprovedForAll(msg.sender, address(this)), "Approve market");

        offerId = nextOfferId++;
        offers[offerId] = Offer({
            seller: msg.sender,
            itemId: itemId,
            quantity: quantity,
            priceXsolla: priceXsolla,
            active: true
        });
        emit OfferListed(offerId, msg.sender, itemId, quantity, priceXsolla);
    }

    function cancel(uint256 offerId) external {
        Offer storage offer = offers[offerId];
        require(offer.active, "Inactive");
        require(offer.seller == msg.sender || msg.sender == owner(), "Not seller");
        offer.active = false;
        emit OfferCancelled(offerId);
    }

    function getOffer(uint256 offerId)
        external
        view
        returns (
            address seller,
            uint256 itemId,
            uint256 quantity,
            uint256 priceXsolla,
            bool active
        )
    {
        Offer storage offer = offers[offerId];
        return (offer.seller, offer.itemId, offer.quantity, offer.priceXsolla, offer.active);
    }

    function buy(uint256 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.active, "Inactive");
        require(offer.seller != msg.sender, "Self");
        offer.active = false;

        uint256 price = offer.priceXsolla;
        uint16 marketBps = _feeBps(offer.seller);
        uint256 versePaid = (price * marketBps) / 10000;

        (address studio, uint16 studioBps, ) = shop.listingEconomy(offer.itemId);
        uint256 studioPaid = (price * studioBps) / 10000;
        if (studioPaid + versePaid > price) {
            studioPaid = price - versePaid;
        }
        uint256 sellerPaid = price - studioPaid - versePaid;

        if (studioPaid > 0 && studio != address(0)) {
            xsolla.safeTransferFrom(msg.sender, studio, studioPaid);
        } else {
            versePaid += studioPaid;
            studioPaid = 0;
        }
        if (versePaid > 0) {
            xsolla.safeTransferFrom(msg.sender, feeRecipient, versePaid);
        }
        if (sellerPaid > 0) {
            xsolla.safeTransferFrom(msg.sender, offer.seller, sellerPaid);
        }

        items.safeTransferFrom(
            offer.seller,
            msg.sender,
            offer.itemId,
            offer.quantity,
            ""
        );

        emit OfferSold(
            offerId,
            msg.sender,
            studio,
            offer.itemId,
            offer.quantity,
            studioPaid,
            versePaid,
            sellerPaid
        );
    }

    function _feeBps(address seller) internal view returns (uint16) {
        uint16 base = feeBps;
        if (stakeView != address(0)) {
            (bool ok, bytes memory data) = stakeView.staticcall(
                abi.encodeWithSignature("marketFeeBps(address)", seller)
            );
            if (ok && data.length >= 32) {
                uint16 fromStake = abi.decode(data, (uint16));
                if (fromStake > 0 && fromStake < base) base = fromStake;
            }
        }
        if (licenseItemId != 0 && xsItems.balanceOf(seller, licenseItemId) > 0) {
            return licenseFeeBps < base ? licenseFeeBps : base;
        }
        return base;
    }
}
