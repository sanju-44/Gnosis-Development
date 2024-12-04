// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;


// implementation contract
contract logicV1 {
    uint public addOn;
    address public Address;
    uint public Value;

    function setValues(uint _no) public payable {
        addOn = _no;
        Address = msg.sender;
        Value = msg.value;
    }
}
contract delegateLogicV1 {
    uint public addOn;
    address public Address;
    uint public Value;

    function setValues(address _implementation, uint _valueToAdd) public payable returns(bytes memory){
        (bool success, ) = _implementation.delegatecall(
            abi.encodeWithSignature("setValues(uint256)", _valueToAdd)
        );

        // Check for errors and revert if necessary
        if (!success) {
            // Handle the error, e.g., by reverting with the error data
            return "failed!!!";
        } else {
            return "success!!!";
        }
    }
}