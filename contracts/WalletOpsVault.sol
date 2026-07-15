// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title WalletOpsVault
/// @notice Automated gas-refill vault. Owner deposits native MON, registers
///         operational wallets with refill policies, and an off-chain
///         automation service submits refuel() calls. The contract is the
///         sole source of truth — the automation service can never bypass
///         the validation rules below.
contract WalletOpsVault {
    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    struct Policy {
        bool active;            // wallet is registered and eligible
        uint128 threshold;      // refuel triggers when wallet.balance < threshold
        uint128 refillAmount;   // amount sent per refuel
        uint64 cooldown;        // min seconds between refuels
        uint32 dailyLimit;      // max refuels per rolling 24h window
        uint64 lastRefillAt;    // timestamp of last successful refuel
        uint64 windowStart;     // start of current 24h counting window
        uint32 refillsInWindow; // refuels used in current window
    }

    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------

    address public owner;
    address public automationOperator; // off-chain bot address, may only call refuel()
    bool public paused;

    mapping(address => Policy) public policies;
    address[] public registeredWallets;
    mapping(address => uint256) private _walletIndex; // 1-based index into registeredWallets

    uint256 private _locked; // reentrancy guard

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event WalletRegistered(address indexed wallet, uint128 threshold, uint128 refillAmount, uint64 cooldown, uint32 dailyLimit);
    event WalletRemoved(address indexed wallet);
    event PolicyUpdated(address indexed wallet, uint128 threshold, uint128 refillAmount, uint64 cooldown, uint32 dailyLimit);
    event WalletPaused(address indexed wallet);
    event WalletResumed(address indexed wallet);
    event VaultPaused();
    event VaultResumed();
    event AutomationOperatorUpdated(address indexed operator);
    event Refueled(address indexed wallet, uint256 amount, uint256 walletBalanceBefore);

    // ---------------------------------------------------------------------
    // Errors
    // ---------------------------------------------------------------------

    error NotOwner();
    error NotAutomation();
    error VaultIsPaused();
    error Reentrant();
    error WalletNotRegistered();
    error WalletAlreadyRegistered();
    error WalletNotActive();
    error AboveThreshold();
    error CooldownActive();
    error DailyLimitReached();
    error InsufficientVaultBalance();
    error TransferFailed();
    error ZeroAddress();
    error ZeroAmount();

    // ---------------------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------------------

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyAutomationOrOwner() {
        if (msg.sender != automationOperator && msg.sender != owner) revert NotAutomation();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert VaultIsPaused();
        _;
    }

    modifier nonReentrant() {
        if (_locked == 1) revert Reentrant();
        _locked = 1;
        _;
        _locked = 0;
    }

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    constructor(address _owner, address _automationOperator) {
        if (_owner == address(0)) revert ZeroAddress();
        owner = _owner;
        automationOperator = _automationOperator;
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    // ---------------------------------------------------------------------
    // Vault funding
    // ---------------------------------------------------------------------

    function deposit() external payable {
        if (msg.value == 0) revert ZeroAmount();
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (amount > address(this).balance) revert InsufficientVaultBalance();
        (bool ok, ) = payable(owner).call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit Withdrawn(owner, amount);
    }

    // ---------------------------------------------------------------------
    // Wallet / policy management
    // ---------------------------------------------------------------------

    function registerWallet(
        address wallet,
        uint128 threshold,
        uint128 refillAmount,
        uint64 cooldown,
        uint32 dailyLimit
    ) external onlyOwner {
        if (wallet == address(0)) revert ZeroAddress();
        if (policies[wallet].active) revert WalletAlreadyRegistered();

        policies[wallet] = Policy({
            active: true,
            threshold: threshold,
            refillAmount: refillAmount,
            cooldown: cooldown,
            dailyLimit: dailyLimit,
            lastRefillAt: 0,
            windowStart: uint64(block.timestamp),
            refillsInWindow: 0
        });

        registeredWallets.push(wallet);
        _walletIndex[wallet] = registeredWallets.length; // 1-based

        emit WalletRegistered(wallet, threshold, refillAmount, cooldown, dailyLimit);
    }

    function removeWallet(address wallet) external onlyOwner {
        if (!policies[wallet].active && _walletIndex[wallet] == 0) revert WalletNotRegistered();

        uint256 idx = _walletIndex[wallet];
        if (idx != 0) {
            uint256 lastIdx = registeredWallets.length;
            address lastWallet = registeredWallets[lastIdx - 1];
            registeredWallets[idx - 1] = lastWallet;
            _walletIndex[lastWallet] = idx;
            registeredWallets.pop();
            delete _walletIndex[wallet];
        }

        delete policies[wallet];
        emit WalletRemoved(wallet);
    }

    function updatePolicy(
        address wallet,
        uint128 threshold,
        uint128 refillAmount,
        uint64 cooldown,
        uint32 dailyLimit
    ) external onlyOwner {
        Policy storage p = policies[wallet];
        if (_walletIndex[wallet] == 0) revert WalletNotRegistered();

        p.threshold = threshold;
        p.refillAmount = refillAmount;
        p.cooldown = cooldown;
        p.dailyLimit = dailyLimit;

        emit PolicyUpdated(wallet, threshold, refillAmount, cooldown, dailyLimit);
    }

    function pauseWallet(address wallet) external onlyOwner {
        if (_walletIndex[wallet] == 0) revert WalletNotRegistered();
        policies[wallet].active = false;
        emit WalletPaused(wallet);
    }

    function resumeWallet(address wallet) external onlyOwner {
        if (_walletIndex[wallet] == 0) revert WalletNotRegistered();
        policies[wallet].active = true;
        emit WalletResumed(wallet);
    }

    // ---------------------------------------------------------------------
    // Vault-level emergency controls
    // ---------------------------------------------------------------------

    function pauseVault() external onlyOwner {
        paused = true;
        emit VaultPaused();
    }

    function resumeVault() external onlyOwner {
        paused = false;
        emit VaultResumed();
    }

    function setAutomationOperator(address operator) external onlyOwner {
        automationOperator = operator;
        emit AutomationOperatorUpdated(operator);
    }

    // ---------------------------------------------------------------------
    // Core refuel logic
    // ---------------------------------------------------------------------

    /// @notice Called by the automation service (or owner) to top up a wallet.
    ///         All eligibility rules are re-verified on-chain; the caller's
    ///         claim that "this wallet is low" is never trusted blindly.
    function refuel(address wallet) external onlyAutomationOrOwner whenNotPaused nonReentrant {
        Policy storage p = policies[wallet];
        if (_walletIndex[wallet] == 0) revert WalletNotRegistered();
        if (!p.active) revert WalletNotActive();

        uint256 walletBalance = wallet.balance;
        if (walletBalance >= p.threshold) revert AboveThreshold();

        if (block.timestamp < p.lastRefillAt + p.cooldown) revert CooldownActive();

        // roll the 24h window if it has elapsed
        if (block.timestamp >= p.windowStart + 1 days) {
            p.windowStart = uint64(block.timestamp);
            p.refillsInWindow = 0;
        }
        if (p.refillsInWindow >= p.dailyLimit) revert DailyLimitReached();

        uint256 amount = p.refillAmount;
        if (amount > address(this).balance) revert InsufficientVaultBalance();

        // effects before interaction
        p.lastRefillAt = uint64(block.timestamp);
        p.refillsInWindow += 1;

        (bool ok, ) = payable(wallet).call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit Refueled(wallet, amount, walletBalance);
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------

    function vaultBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getRegisteredWallets() external view returns (address[] memory) {
        return registeredWallets;
    }

    function isRefuelEligible(address wallet) external view returns (bool eligible, string memory reason) {
        Policy storage p = policies[wallet];
        if (_walletIndex[wallet] == 0) return (false, "not registered");
        if (!p.active) return (false, "wallet paused");
        if (paused) return (false, "vault paused");
        if (wallet.balance >= p.threshold) return (false, "above threshold");
        if (block.timestamp < p.lastRefillAt + p.cooldown) return (false, "cooldown active");

        uint32 refillsInWindow = p.refillsInWindow;
        if (block.timestamp >= p.windowStart + 1 days) {
            refillsInWindow = 0;
        }
        if (refillsInWindow >= p.dailyLimit) return (false, "daily limit reached");
        if (p.refillAmount > address(this).balance) return (false, "insufficient vault balance");

        return (true, "");
    }
}
