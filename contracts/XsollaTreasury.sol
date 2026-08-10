// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./XsollaToken.sol";

/**
 * @title XsollaTreasury
 * @notice Buy / escrow / stake / swap hub for XSOLLA (TILE Manager analogue).
 *
 * Flow:
 * 1) buyXsolla() with native POL/ETH → mint XSOLLA 1:1 (wei)
 * 2) buyXsollaWithUsdc/Usdt / swap*ForXsolla → mint XSOLLA from stables
 * 3) deposit() → lock XSOLLA as play credits
 * 4) withdrawPlayCredits() in demoMode, or release() by operator
 * 5) stake() / unstake() for VIP / future governance
 * 6) swapXsollaForUsdc/Usdt / swapXsollaForNative() cash out
 */
contract XsollaTreasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    XsollaToken public immutable token;
    IERC20 public usdc;
    IERC20 public usdt;

    address public operator;
    bool public demoMode = true;

    /// @notice Stable base units (6 decimals) per 1 full XSOLLA (1e18 wei). Default 1:1.
    uint256 public usdcPerXsolla = 1e6;
    uint256 public usdtPerXsolla = 1e6;

    mapping(address => uint256) public playCredits;
    mapping(address => uint256) public staked;

    event Bought(address indexed user, uint256 amount);
    event BoughtWithUsdc(address indexed user, uint256 xsollaAmount, uint256 usdcAmount);
    event BoughtWithUsdt(address indexed user, uint256 xsollaAmount, uint256 usdtAmount);
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event Swapped(address indexed user, uint256 amount);
    event SwappedXsollaForUsdc(address indexed user, uint256 xsollaAmount, uint256 usdcAmount);
    event SwappedUsdcForXsolla(address indexed user, uint256 usdcAmount, uint256 xsollaAmount);
    event SwappedXsollaForUsdt(address indexed user, uint256 xsollaAmount, uint256 usdtAmount);
    event SwappedUsdtForXsolla(address indexed user, uint256 usdtAmount, uint256 xsollaAmount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event OperatorUpdated(address indexed operator);
    event DemoModeUpdated(bool enabled);
    event UsdcUpdated(address indexed usdc);
    event UsdtUpdated(address indexed usdt);
    event UsdcRateUpdated(uint256 usdcPerXsolla);
    event UsdtRateUpdated(uint256 usdtPerXsolla);

    modifier onlyOperator() {
        require(msg.sender == operator || msg.sender == owner(), "Not operator");
        _;
    }

    constructor(
        address tokenAddress,
        address initialOperator,
        address usdcAddress,
        address usdtAddress
    ) {
        require(tokenAddress != address(0), "Invalid token");
        token = XsollaToken(tokenAddress);
        operator = initialOperator == address(0) ? msg.sender : initialOperator;
        if (usdcAddress != address(0)) {
            usdc = IERC20(usdcAddress);
        }
        if (usdtAddress != address(0)) {
            usdt = IERC20(usdtAddress);
        }
    }

    receive() external payable {}

    function setOperator(address newOperator) external onlyOwner {
        require(newOperator != address(0), "Invalid operator");
        operator = newOperator;
        emit OperatorUpdated(newOperator);
    }

    function setDemoMode(bool enabled) external onlyOwner {
        demoMode = enabled;
        emit DemoModeUpdated(enabled);
    }

    function setUsdc(address usdcAddress) external onlyOwner {
        require(usdcAddress != address(0), "Invalid USDC");
        usdc = IERC20(usdcAddress);
        emit UsdcUpdated(usdcAddress);
    }

    function setUsdt(address usdtAddress) external onlyOwner {
        require(usdtAddress != address(0), "Invalid USDT");
        usdt = IERC20(usdtAddress);
        emit UsdtUpdated(usdtAddress);
    }

    function setUsdcPerXsolla(uint256 rate) external onlyOwner {
        require(rate > 0, "Invalid rate");
        usdcPerXsolla = rate;
        emit UsdcRateUpdated(rate);
    }

    function setUsdtPerXsolla(uint256 rate) external onlyOwner {
        require(rate > 0, "Invalid rate");
        usdtPerXsolla = rate;
        emit UsdtRateUpdated(rate);
    }

    function quoteXsollaToUsdc(uint256 xsollaAmount) public view returns (uint256) {
        return (xsollaAmount * usdcPerXsolla) / 1e18;
    }

    function quoteUsdcToXsolla(uint256 usdcAmount) public view returns (uint256) {
        return (usdcAmount * 1e18) / usdcPerXsolla;
    }

    function quoteXsollaToUsdt(uint256 xsollaAmount) public view returns (uint256) {
        return (xsollaAmount * usdtPerXsolla) / 1e18;
    }

    function quoteUsdtToXsolla(uint256 usdtAmount) public view returns (uint256) {
        return (usdtAmount * 1e18) / usdtPerXsolla;
    }

    /// @notice Buy XSOLLA 1:1 with native gas token (POL/ETH), like buyTile().
    function buyXsolla() external payable nonReentrant {
        require(msg.value > 0, "Zero value");
        token.mint(msg.sender, msg.value);
        emit Bought(msg.sender, msg.value);
    }

    /// @notice Buy XSOLLA with USDC at the configured rate (mints XSOLLA).
    function buyXsollaWithUsdc(uint256 usdcAmount) external nonReentrant {
        require(address(usdc) != address(0), "USDC not set");
        require(usdcAmount > 0, "Zero amount");
        uint256 xsollaAmount = quoteUsdcToXsolla(usdcAmount);
        require(xsollaAmount > 0, "Amount too small");
        usdc.safeTransferFrom(msg.sender, address(this), usdcAmount);
        token.mint(msg.sender, xsollaAmount);
        emit BoughtWithUsdc(msg.sender, xsollaAmount, usdcAmount);
        emit SwappedUsdcForXsolla(msg.sender, usdcAmount, xsollaAmount);
    }

    /// @notice Lock XSOLLA into play escrow.
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        playCredits[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    /// @notice Demo withdraw from escrow (disable in production).
    function withdrawPlayCredits(uint256 amount) external nonReentrant {
        require(demoMode, "Demo disabled; use operator release");
        require(amount > 0, "Zero amount");
        require(playCredits[msg.sender] >= amount, "Insufficient credits");
        playCredits[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Production cash-out: backend operator releases escrowed XSOLLA.
    function release(address user, uint256 amount) external onlyOperator nonReentrant {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Zero amount");
        require(playCredits[user] >= amount, "Insufficient credits");
        playCredits[user] -= amount;
        require(token.transfer(user, amount), "Transfer failed");
        emit Withdrawn(user, amount);
    }

    /// @notice Operator can credit escrow (e.g. sync off-chain winnings).
    function operatorCredit(address user, uint256 amount) external onlyOperator nonReentrant {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Zero amount");
        token.mint(address(this), amount);
        playCredits[user] += amount;
        emit Deposited(user, amount);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        staked[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(staked[msg.sender] >= amount, "Insufficient stake");
        staked[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    /// @notice Swap XSOLLA → USDC from treasury liquidity.
    function swapXsollaForUsdc(uint256 xsollaAmount) external nonReentrant {
        require(address(usdc) != address(0), "USDC not set");
        require(xsollaAmount > 0, "Zero amount");
        uint256 usdcAmount = quoteXsollaToUsdc(xsollaAmount);
        require(usdcAmount > 0, "Amount too small");
        require(usdc.balanceOf(address(this)) >= usdcAmount, "Insufficient USDC liquidity");
        require(token.transferFrom(msg.sender, address(this), xsollaAmount), "Transfer failed");
        usdc.safeTransfer(msg.sender, usdcAmount);
        emit SwappedXsollaForUsdc(msg.sender, xsollaAmount, usdcAmount);
    }

    /// @notice Swap USDC → XSOLLA (same as buyXsollaWithUsdc; kept for UI clarity).
    function swapUsdcForXsolla(uint256 usdcAmount) external nonReentrant {
        require(address(usdc) != address(0), "USDC not set");
        require(usdcAmount > 0, "Zero amount");
        uint256 xsollaAmount = quoteUsdcToXsolla(usdcAmount);
        require(xsollaAmount > 0, "Amount too small");
        usdc.safeTransferFrom(msg.sender, address(this), usdcAmount);
        token.mint(msg.sender, xsollaAmount);
        emit SwappedUsdcForXsolla(msg.sender, usdcAmount, xsollaAmount);
        emit BoughtWithUsdc(msg.sender, xsollaAmount, usdcAmount);
    }

    /// @notice Buy XSOLLA with USDT at the configured rate (mints XSOLLA).
    function buyXsollaWithUsdt(uint256 usdtAmount) external nonReentrant {
        require(address(usdt) != address(0), "USDT not set");
        require(usdtAmount > 0, "Zero amount");
        uint256 xsollaAmount = quoteUsdtToXsolla(usdtAmount);
        require(xsollaAmount > 0, "Amount too small");
        usdt.safeTransferFrom(msg.sender, address(this), usdtAmount);
        token.mint(msg.sender, xsollaAmount);
        emit BoughtWithUsdt(msg.sender, xsollaAmount, usdtAmount);
        emit SwappedUsdtForXsolla(msg.sender, usdtAmount, xsollaAmount);
    }

    /// @notice Swap XSOLLA → USDT from treasury liquidity.
    function swapXsollaForUsdt(uint256 xsollaAmount) external nonReentrant {
        require(address(usdt) != address(0), "USDT not set");
        require(xsollaAmount > 0, "Zero amount");
        uint256 usdtAmount = quoteXsollaToUsdt(xsollaAmount);
        require(usdtAmount > 0, "Amount too small");
        require(usdt.balanceOf(address(this)) >= usdtAmount, "Insufficient USDT liquidity");
        require(token.transferFrom(msg.sender, address(this), xsollaAmount), "Transfer failed");
        usdt.safeTransfer(msg.sender, usdtAmount);
        emit SwappedXsollaForUsdt(msg.sender, xsollaAmount, usdtAmount);
    }

    /// @notice Swap USDT → XSOLLA.
    function swapUsdtForXsolla(uint256 usdtAmount) external nonReentrant {
        require(address(usdt) != address(0), "USDT not set");
        require(usdtAmount > 0, "Zero amount");
        uint256 xsollaAmount = quoteUsdtToXsolla(usdtAmount);
        require(xsollaAmount > 0, "Amount too small");
        usdt.safeTransferFrom(msg.sender, address(this), usdtAmount);
        token.mint(msg.sender, xsollaAmount);
        emit SwappedUsdtForXsolla(msg.sender, usdtAmount, xsollaAmount);
        emit BoughtWithUsdt(msg.sender, xsollaAmount, usdtAmount);
    }

    /// @notice Swap XSOLLA back to native 1:1 when treasury holds liquidity.
    function swapXsollaForNative(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(address(this).balance >= amount, "Insufficient liquidity");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Native transfer failed");
        emit Swapped(msg.sender, amount);
    }

    /// @notice Owner can pull USDC liquidity into the treasury.
    function fundUsdc(uint256 amount) external onlyOwner {
        require(address(usdc) != address(0), "USDC not set");
        usdc.safeTransferFrom(msg.sender, address(this), amount);
    }

    /// @notice Owner can pull USDT liquidity into the treasury.
    function fundUsdt(uint256 amount) external onlyOwner {
        require(address(usdt) != address(0), "USDT not set");
        usdt.safeTransferFrom(msg.sender, address(this), amount);
    }

    /// @notice Small demo reward mint (TILE claimTile analogue). Cap per call.
    function claimPlayReward(uint256 amount) external nonReentrant {
        require(demoMode, "Rewards claim disabled");
        require(amount > 0 && amount <= 100 ether, "Amount out of range");
        token.mint(msg.sender, amount);
        emit RewardsClaimed(msg.sender, amount);
    }

    function stakedBalance(address user) external view returns (uint256) {
        return staked[user];
    }

    function usdcLiquidity() external view returns (uint256) {
        if (address(usdc) == address(0)) return 0;
        return usdc.balanceOf(address(this));
    }

    function usdtLiquidity() external view returns (uint256) {
        if (address(usdt) == address(0)) return 0;
        return usdt.balanceOf(address(this));
    }
}
