// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/Note.sol";

contract NoteScript is Script{
    function run() external {
        vm.startBroadcast();

        new Note();    

        vm.stopBroadcast();
    }
}