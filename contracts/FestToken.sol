pragma solidity ^0.6.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FestToken is Context, ERC20 {
    constructor() public ERC20("FestToken", "TCKT") {
        _mint(_msgSender(), 250000* (10**uint256(decimals())));
    }
}
