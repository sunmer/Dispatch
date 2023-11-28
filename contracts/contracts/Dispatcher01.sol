// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract Dispatcher01 is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    
    function initialize() public initializer {
        __Ownable_init();
    }

    struct Comment {
        uint256 id;
        address sender;
        string content;
        uint256 fundraiserId;
    }

    struct Fundraiser {
        uint256 id;
        address sender;
        string content;
        uint256 amount;
        uint256 goalAmount;
        uint256 deadline;
    }

    uint256 private constant FEE_PERCENT = 0;
    uint256 public accumulatedFees;

    uint256 public nextCommentId;
    uint256 public nextFundraiserId;

    mapping(uint256 => Comment) public commentById;
    mapping(uint256 => Fundraiser) public fundraiserById;
    mapping(uint256 => mapping(address => uint256)) public contributionAmounts;

    event CommentCreated(
        uint256 indexed id,
        uint256 indexed fundraiserId,
        address indexed sender,
        string content,
        uint256 timestamp
    );

    event RefundClaimed(
        uint256 indexed fundraiserId,
        address indexed claimer,
        uint256 amount
    );

    event FundraiserCreated(
        uint256 indexed id,
        address indexed sender,
        string content,
        uint256 goalAmount,
        uint256 deadline,
        uint256 timestamp
    );

    event Contribution(
        uint256 indexed fundraiserId,
        address indexed sender,
        uint256 amount,
        uint256 timestamp
    );

    event AmountClaimed(
        uint256 indexed id,
        address indexed claimer,
        uint256 amount
    );

    function createComment(
        string memory _content,
        uint256 _fundraiserId
    ) public {
        require(bytes(_content).length != 0, "Content is empty");
        if (_fundraiserId != 0) {
            require(
                fundraiserById[_fundraiserId].sender != address(0),
                "Fundraiser not found"
            );
        }

        Comment memory newComment = Comment({
            id: nextCommentId,
            sender: msg.sender,
            content: _content,
            fundraiserId: _fundraiserId
        });

        commentById[nextCommentId] = newComment;

        emit CommentCreated(
            nextCommentId,
            _fundraiserId,
            msg.sender,
            _content,
            block.timestamp
        );

        nextCommentId++;
    }

    function createFundraiser(
        string memory _content,
        uint256 _goalAmount,
        uint256 _deadline
    ) public {
        require(bytes(_content).length != 0, "Content is empty");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        Fundraiser memory newFundraiser = Fundraiser({
            id: nextFundraiserId,
            sender: msg.sender,
            content: _content,
            amount: 0,
            goalAmount: _goalAmount,
            deadline: _deadline
        });

        fundraiserById[nextFundraiserId] = newFundraiser;
        emit FundraiserCreated(
            nextFundraiserId,
            msg.sender,
            _content,
            _goalAmount,
            _deadline,
            block.timestamp
        );

        nextFundraiserId++;
    }

    modifier hasSentEth() {
        require(msg.value > 0, "Must send ETH");
        _;
    }

    modifier fundraiserExists(uint256 _fundraiserId) {
        require(
            fundraiserById[_fundraiserId].sender != address(0),
            "Fundraiser not found"
        );
        _;
    }

    function contribute(
        uint256 _fundraiserId
    ) public payable hasSentEth fundraiserExists(_fundraiserId) {
        Fundraiser storage targetFundraiser = fundraiserById[_fundraiserId];
        targetFundraiser.amount += msg.value;
        contributionAmounts[_fundraiserId][msg.sender] += msg.value;

        emit Contribution(
            _fundraiserId,
            msg.sender,
            msg.value,
            block.timestamp
        );
    }

    function claimFundraiserAmount(
        uint256 _fundraiserId
    ) public nonReentrant fundraiserExists(_fundraiserId) {
        Fundraiser storage targetFundraiser = fundraiserById[_fundraiserId];

        require(
            targetFundraiser.sender == msg.sender,
            "Only the creator of the fundraiser can claim"
        );
        require(targetFundraiser.amount != 0, "No amount to claim");
        require(
            block.timestamp >= targetFundraiser.deadline,
            "Fundraiser has not reached its deadline"
        );
        require(
            targetFundraiser.amount >= targetFundraiser.goalAmount,
            "Fundraising goal not reached"
        );

        uint256 amountToClaim = targetFundraiser.amount;

        uint256 fee = (amountToClaim * FEE_PERCENT) / 100;
        accumulatedFees += fee;
        amountToClaim -= fee;

        uint256 amount = targetFundraiser.amount;
        targetFundraiser.amount = 0;
        payable(msg.sender).transfer(amount);
        emit AmountClaimed(_fundraiserId, msg.sender, amountToClaim);
    }

    function claimRefund(
        uint256 _fundraiserId
    ) public nonReentrant fundraiserExists(_fundraiserId) {
        Fundraiser storage targetFundraiser = fundraiserById[_fundraiserId];

        require(
            block.timestamp >= targetFundraiser.deadline,
            "Fundraiser is still active"
        );
        require(
            targetFundraiser.amount < targetFundraiser.goalAmount,
            "Fundraising goal was reached"
        );

        uint256 contributedAmount = contributionAmounts[_fundraiserId][
            msg.sender
        ];
        require(contributedAmount > 0, "No contributions found for sender");

        contributionAmounts[_fundraiserId][msg.sender] = 0;
        payable(msg.sender).transfer(contributedAmount);

        emit RefundClaimed(_fundraiserId, msg.sender, contributedAmount);
    }

    function claimFees() external onlyOwner {
        require(accumulatedFees > 0, "No fees to claim");

        uint256 amount = accumulatedFees;
        accumulatedFees = 0;
        payable(owner()).transfer(amount);
    }
}
