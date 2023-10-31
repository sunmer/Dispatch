// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


contract DispatcherV2 is Initializable {

    struct Dispatch {
        uint256 id;
        address sender;
        string content;
        uint256 pledge;
        uint256 parentId;
    }

    uint256 private nextDispatchId;

    function initialize() public initializer {
        nextDispatchId = 1;
    }

    event DispatchCreated(
        uint256 indexed id,
        address indexed sender,
        string content,
        uint256 timestamp
    );

    event DispatchReplied(
        uint256 indexed id,
        uint256 indexed parentId,
        address indexed sender,
        string content,
        uint256 timestamp
    );

    event Pledged(
        uint256 indexed dispatchId,
        address indexed sender,
        uint256 amount,
        uint timestamp
    );

    event PledgeClaimed(
        uint256 indexed id,
        address indexed claimer,
        uint256 amount
    );

    event Message(
      string content
    );

    mapping(address => Dispatch[]) public dispatchesByAddress;
    mapping(uint256 => Dispatch) public dispatchById;
    mapping(uint256 => Dispatch[]) public repliesByDispatchId;

    function createDispatch(string memory _content, uint256 _parentId) public payable {
        emit Message("foobar");
        
        if(_parentId != 0) {
          require(dispatchById[_parentId].sender != address(0), "Parent Dispatch not found");
        }

        Dispatch memory newDispatch = Dispatch({
            id: nextDispatchId,
            sender: msg.sender,
            content: _content,
            pledge: 0,
            parentId: _parentId
        });

        dispatchById[nextDispatchId] = newDispatch;
        dispatchesByAddress[msg.sender].push(newDispatch);

        if (_parentId == 0) {
            emit DispatchCreated(
                nextDispatchId,
                msg.sender,
                _content,
                block.timestamp
            );
        } else {
            repliesByDispatchId[_parentId].push(newDispatch);
            emit DispatchReplied(
                nextDispatchId,
                _parentId,
                msg.sender,
                _content,
                block.timestamp
            );
        }

        nextDispatchId++;
    }

    function pledge(uint256 _dispatchId) public payable {
        require(msg.value > 0, "Must send ETH to pledge");
        Dispatch storage targetDispatch = dispatchById[_dispatchId];
        require(targetDispatch.sender != address(0), "Dispatch not found");

        targetDispatch.pledge += msg.value;

        emit Pledged(_dispatchId, msg.sender, msg.value, block.timestamp);
    }

    function claimPledge(uint256 _dispatchId) public {
        Dispatch storage targetDispatch = dispatchById[_dispatchId];
        require(targetDispatch.sender == msg.sender, "Only the creator of the Dispatch can claim");
        require(targetDispatch.pledge > 0, "No pledge to claim");

        uint256 amountToClaim = targetDispatch.pledge;
        targetDispatch.pledge = 0;

        payable(msg.sender).transfer(amountToClaim);

        emit PledgeClaimed(_dispatchId, msg.sender, amountToClaim);
    }

    function getDispatchesByAddress(address _address) public view returns (Dispatch[] memory) {
        return dispatchesByAddress[_address];
    }

    function getRepliesByDispatchId(uint256 _dispatchId) public view returns (Dispatch[] memory) {
        return repliesByDispatchId[_dispatchId];
    }
}
