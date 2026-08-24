// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./XsollaItems.sol";

/**
 * @title XsollaShop
 * @notice Primary item shop. XSOLLA purchases split between studio and Verse.
 */
contract XsollaShop is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable xsolla;
    XsollaItems public immutable items;
    address public paymentRecipient;
    address public stakeView;
    uint16 public constant MAX_STUDIO_BPS = 8000;

    struct Listing {
        uint256 priceXsolla;
        bool active;
        string name;
        string metadataURI;
        string game;
        string kind;
        string perk;
        address studio;
        uint16 studioBps;
        bool soulbound;
    }

    mapping(uint256 => Listing) public listings;
    mapping(address => bool) public isStudio;
    uint256 public nextItemId = 1;
    uint256 public nextGameId = 1;

    struct GameTitle {
        address studio;
        string name;
        string blurb;
        string coverURI;
        string playUrl;
        string platforms;
        bool active;
    }

    mapping(uint256 => GameTitle) public games;
    mapping(uint256 => uint256) public itemGameId;

    event ItemListed(
        uint256 indexed itemId,
        uint256 priceXsolla,
        string name,
        string metadataURI,
        string game,
        string kind,
        address studio,
        uint16 studioBps
    );
    event ItemUpdated(uint256 indexed itemId, uint256 priceXsolla, bool active);
    event ItemPurchased(
        address indexed buyer,
        uint256 indexed itemId,
        address indexed studio,
        uint256 quantity,
        uint256 totalPaid,
        uint256 studioPaid,
        uint256 versePaid
    );
    event PaymentRecipientUpdated(address indexed recipient);
    event StakeViewUpdated(address indexed stakeView);
    event StudioUpdated(address indexed studio, bool allowed);
    event GameRegistered(
        uint256 indexed gameId,
        address indexed studio,
        string name
    );
    event GameUpdated(uint256 indexed gameId, string name, bool active);

    constructor(address xsollaToken, address itemsContract, address recipient) Ownable(msg.sender) {
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

    function setStakeView(address stakeView_) external onlyOwner {
        stakeView = stakeView_;
        emit StakeViewUpdated(stakeView_);
    }

    function setStudio(address studio, bool allowed) external onlyOwner {
        require(studio != address(0), "Invalid studio");
        isStudio[studio] = allowed;
        emit StudioUpdated(studio, allowed);
    }

    function registerGame(
        string calldata name_,
        string calldata blurb,
        string calldata coverURI,
        string calldata playUrl,
        string calldata platforms
    ) external returns (uint256 gameId) {
        require(isStudio[msg.sender], "Not a studio");
        return
            _registerGame(
                msg.sender,
                name_,
                blurb,
                coverURI,
                playUrl,
                platforms
            );
    }

    function registerGameFor(
        address studio_,
        string calldata name_,
        string calldata blurb,
        string calldata coverURI,
        string calldata playUrl,
        string calldata platforms
    ) external onlyOwner returns (uint256 gameId) {
        require(studio_ != address(0), "Invalid studio");
        return
            _registerGame(studio_, name_, blurb, coverURI, playUrl, platforms);
    }

    function _registerGame(
        address studio_,
        string memory name_,
        string memory blurb,
        string memory coverURI,
        string memory playUrl,
        string memory platforms
    ) internal returns (uint256 gameId) {
        require(bytes(name_).length > 0, "Invalid name");
        gameId = nextGameId++;
        GameTitle storage g = games[gameId];
        g.studio = studio_;
        g.name = name_;
        g.blurb = blurb;
        g.coverURI = coverURI;
        g.playUrl = playUrl;
        g.platforms = platforms;
        g.active = true;
        emit GameRegistered(gameId, studio_, name_);
    }

    function updateOwnGame(
        uint256 gameId,
        string calldata name_,
        string calldata blurb,
        string calldata coverURI,
        string calldata playUrl,
        string calldata platforms,
        bool active
    ) external {
        GameTitle storage g = games[gameId];
        require(g.studio == msg.sender, "Not your game");
        require(bytes(name_).length > 0, "Invalid name");
        g.name = name_;
        g.blurb = blurb;
        g.coverURI = coverURI;
        g.playUrl = playUrl;
        g.platforms = platforms;
        g.active = active;
        emit GameUpdated(gameId, name_, active);
    }

    function getGame(uint256 gameId)
        external
        view
        returns (
            address studio,
            string memory name_,
            string memory blurb,
            string memory coverURI,
            string memory playUrl,
            string memory platforms,
            bool active
        )
    {
        GameTitle storage g = games[gameId];
        return (
            g.studio,
            g.name,
            g.blurb,
            g.coverURI,
            g.playUrl,
            g.platforms,
            g.active
        );
    }

    function listItem(
        uint256 priceXsolla,
        string calldata name_,
        string calldata metadataURI,
        string calldata game_
    ) external onlyOwner returns (uint256 itemId) {
        return
            _listEcosystemItem(
                priceXsolla,
                name_,
                metadataURI,
                game_,
                "cosmetic",
                "",
                address(0),
                0,
                false
            );
    }

    function listEcosystemItem(
        uint256 priceXsolla,
        string calldata name_,
        string calldata metadataURI,
        string calldata game_,
        string calldata kind_,
        string calldata perk_,
        address studio,
        uint16 studioBps,
        bool soulbound_
    ) public onlyOwner returns (uint256 itemId) {
        return
            _listEcosystemItem(
                priceXsolla,
                name_,
                metadataURI,
                game_,
                kind_,
                perk_,
                studio,
                studioBps,
                soulbound_
            );
    }

    /// @notice Registered studio lists a pack/cosmetic for their own payout address.
    /// Split capped at 80%. Cannot mint XSOLLA or mark items soulbound.
    function listForStudio(
        uint256 priceXsolla,
        string calldata name_,
        string calldata metadataURI,
        uint256 gameId,
        string calldata kind_,
        uint16 studioBps
    ) external returns (uint256 itemId) {
        require(isStudio[msg.sender], "Not a studio");
        require(studioBps <= MAX_STUDIO_BPS, "Split too high");
        string memory kind = bytes(kind_).length == 0 ? "pack" : kind_;
        require(_okStudioKind(kind), "Invalid kind");
        GameTitle storage g = games[gameId];
        require(g.studio == msg.sender && g.active, "Unknown game");
        itemId = _listEcosystemItem(
            priceXsolla,
            name_,
            metadataURI,
            g.name,
            kind,
            "",
            msg.sender,
            studioBps,
            false
        );
        itemGameId[itemId] = gameId;
    }

    function _listEcosystemItem(
        uint256 priceXsolla,
        string memory name_,
        string memory metadataURI,
        string memory game_,
        string memory kind_,
        string memory perk_,
        address studio,
        uint16 studioBps,
        bool soulbound_
    ) internal returns (uint256 itemId) {
        require(priceXsolla > 0, "Invalid price");
        require(bytes(name_).length > 0, "Invalid name");
        require(bytes(game_).length > 0, "Invalid game");
        require(studioBps <= 10000, "Invalid bps");
        if (studioBps > 0) require(studio != address(0), "Invalid studio");

        itemId = nextItemId++;
        Listing storage listing = listings[itemId];
        listing.priceXsolla = priceXsolla;
        listing.active = true;
        listing.name = name_;
        listing.metadataURI = metadataURI;
        listing.game = game_;
        listing.kind = kind_;
        listing.perk = perk_;
        listing.studio = studio;
        listing.studioBps = studioBps;
        listing.soulbound = soulbound_;
        items.setTokenURI(itemId, metadataURI);
        if (soulbound_) items.setSoulbound(itemId, true);
        emit ItemListed(
            itemId,
            priceXsolla,
            name_,
            metadataURI,
            game_,
            kind_,
            studio,
            studioBps
        );
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

    function updateOwnItem(
        uint256 itemId,
        uint256 priceXsolla,
        bool active,
        string calldata name_,
        string calldata metadataURI,
        string calldata game_
    ) external {
        require(isStudio[msg.sender], "Not a studio");
        Listing storage listing = listings[itemId];
        require(listing.studio == msg.sender, "Not your listing");
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

    function _okStudioKind(string memory kind_) internal pure returns (bool) {
        bytes32 k = keccak256(bytes(kind_));
        return
            k == keccak256("pack") ||
            k == keccak256("cosmetic") ||
            k == keccak256("pass") ||
            k == keccak256("utility");
    }

    function getListing(uint256 itemId)
        external
        view
        returns (
            uint256 priceXsolla,
            bool active,
            string memory name_,
            string memory metadataURI,
            string memory game_,
            string memory kind_,
            string memory perk_,
            address studio,
            uint16 studioBps,
            bool soulbound
        )
    {
        Listing storage listing = listings[itemId];
        return (
            listing.priceXsolla,
            listing.active,
            listing.name,
            listing.metadataURI,
            listing.game,
            listing.kind,
            listing.perk,
            listing.studio,
            listing.studioBps,
            listing.soulbound
        );
    }

    function listingEconomy(uint256 itemId)
        external
        view
        returns (address studio, uint16 studioBps, bool soulbound)
    {
        Listing storage listing = listings[itemId];
        return (listing.studio, listing.studioBps, listing.soulbound);
    }

    function buy(uint256 itemId, uint256 quantity) external nonReentrant {
        require(quantity > 0, "Zero quantity");
        Listing storage listing = listings[itemId];
        require(listing.active, "Item not for sale");
        require(listing.priceXsolla > 0, "Invalid listing");

        uint256 total = listing.priceXsolla * quantity;
        require(total / quantity == listing.priceXsolla, "Overflow");

        uint256 studioPaid = (total * listing.studioBps) / 10000;
        uint256 versePaid = total - studioPaid;
        uint256 discount = (total * _shopDiscountBps(msg.sender)) / 10000;
        if (discount > versePaid) discount = versePaid;
        versePaid -= discount;

        if (studioPaid > 0) {
            xsolla.safeTransferFrom(msg.sender, listing.studio, studioPaid);
        }
        if (versePaid > 0) {
            xsolla.safeTransferFrom(msg.sender, paymentRecipient, versePaid);
        }
        items.mint(msg.sender, itemId, quantity, "");

        emit ItemPurchased(
            msg.sender,
            itemId,
            listing.studio,
            quantity,
            total - discount,
            studioPaid,
            versePaid
        );
    }

    function _shopDiscountBps(address user) internal view returns (uint16) {
        if (stakeView == address(0)) return 0;
        (bool ok, bytes memory data) = stakeView.staticcall(
            abi.encodeWithSignature("shopDiscountBps(address)", user)
        );
        if (!ok || data.length < 32) return 0;
        return abi.decode(data, (uint16));
    }
}
