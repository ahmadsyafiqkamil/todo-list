// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Note {
    struct Task {
        uint id;
        string title;
        string content;
        bool completed;
    }

    mapping(address => Task[]) private userTasks;
    mapping(uint => bool) private taskExists; // Untuk memastikan ID unik

    event TaskAdded(address indexed user, uint taskId, string title, string content);
    event TaskCompleted(address indexed user, uint taskId);
    event TaskDeleted(address indexed user, uint taskId);

    function generateTaskId() private view returns (uint) {
        uint randomId = uint(keccak256(abi.encodePacked(msg.sender, block.timestamp, userTasks[msg.sender].length))) % 10**10;
        return randomId;
    }

    function addTask(string memory _content, string memory _title) public {
        require(bytes(_content).length > 0, "Task content cannot be empty");

        uint taskId = generateTaskId();

        // Pastikan ID unik dengan rehash jika sudah ada
        while (taskExists[taskId]) {
            taskId = uint(keccak256(abi.encodePacked(taskId, block.difficulty))) % 10**10;
        }

        userTasks[msg.sender].push(Task(taskId, _title, _content, false));
        taskExists[taskId] = true;

        emit TaskAdded(msg.sender, taskId, _title, _content);
    }

    function completeTask(uint _taskId) public {
        for (uint i = 0; i < userTasks[msg.sender].length; i++) {
            if (userTasks[msg.sender][i].id == _taskId) {
                userTasks[msg.sender][i].completed = true;
                emit TaskCompleted(msg.sender, _taskId);
                return;
            }
        }
        revert("Task ID not found");
    }

    function deleteTask(uint _taskId) public {
        uint index = userTasks[msg.sender].length;
        for (uint i = 0; i < userTasks[msg.sender].length; i++) {
            if (userTasks[msg.sender][i].id == _taskId) {
                index = i;
                break;
            }
        }
        require(index < userTasks[msg.sender].length, "Invalid task id");

        taskExists[_taskId] = false;
        userTasks[msg.sender][index] = userTasks[msg.sender][userTasks[msg.sender].length - 1];
        userTasks[msg.sender].pop();

        emit TaskDeleted(msg.sender, _taskId);
    }

    function getTasks() public view returns (Task[] memory) {
        return userTasks[msg.sender];
    }
}
