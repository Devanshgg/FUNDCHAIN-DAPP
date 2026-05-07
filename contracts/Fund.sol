// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Fund {
    mapping(address => uint) public contributors;
    address public manager;
    uint public minContribution;
    uint public deadline;
    uint public target;
    uint public raiseAmount;
    uint public noOfContributors;

    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool completed;
        uint noOfVoters;
        mapping(address => bool) voters;
    }
    mapping(uint => Request) public requests;
    uint public numRequest;

    constructor(uint _target, uint _deadline) {
        target = _target;
        deadline = block.timestamp + _deadline;
        minContribution = 100 wei;
        manager = msg.sender;
    }

    function sendEth() public payable {
        require(block.timestamp < deadline, "deadline has passed");
        require(msg.value >= minContribution, "minimum contribution is 100 wei");
        if (contributors[msg.sender] == 0) {
            noOfContributors++;
        }
        contributors[msg.sender] += msg.value;
        raiseAmount += msg.value;
    }

    function checkBalance() public view returns (uint) {
        return address(this).balance;
    }

    function refund() public {
        require(block.timestamp > deadline && raiseAmount < target, "you are not eligible");
        require(contributors[msg.sender] > 0);
        address payable user = payable(msg.sender);
        user.transfer(contributors[msg.sender]);
        contributors[msg.sender] = 0;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "only manager can call this");
        _;
    }

    function createRequest(
        string memory _description,
        uint _value,
        address payable _recipient
    ) public onlyManager {
        Request storage newRequest = requests[numRequest];
        numRequest++;
        newRequest.description = _description;
        newRequest.value = _value;
        newRequest.recipient = _recipient;
        newRequest.completed = false;
        newRequest.noOfVoters = 0;
    }

    function voteRequest(uint _requestId) public {
        require(contributors[msg.sender] > 0, "you must be a contributor");
        Request storage thisRequest = requests[_requestId];
        require(thisRequest.voters[msg.sender] == false, "you have already voted");
        thisRequest.voters[msg.sender] = true;
        thisRequest.noOfVoters++;
    }

    function makePayment(uint _requestId) public onlyManager {
        require(raiseAmount >= target);
        Request storage thisRequest = requests[_requestId];
        require(thisRequest.completed == false, "the request has been completed");
        require(thisRequest.noOfVoters > noOfContributors / 2, "Majority does not support");
        thisRequest.recipient.transfer(thisRequest.value);
        thisRequest.completed = true;
    }
}
