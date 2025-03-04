// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Note{
    struct Task{
        uint id;
        string title;
        string content;
        bool completed;
    }

    mapping(address => Task[]) private userTasks;

    event TaskAdded(address indexed user, uint taskId, string title, string content);
    event TaskCompleted(address indexed user, uint taskId);
    event TaskDeleted(address indexed user, uint taskId);

    function addTask(string memory _content, string memory _title) public {
        require(bytes(_content).length > 0, "Task content cannot be empty");

        uint taskId = userTasks[msg.sender].length;

        userTasks[msg.sender].push(Task(taskId, _title, _content, false));

        emit TaskAdded(msg.sender, taskId, _title ,_content);
    }

    function completeTask(uint _taskId) public {
        require(_taskId < userTasks[msg.sender].length, "Invalid task id");
        
        userTasks[msg.sender][_taskId].completed = true;
        
        emit TaskCompleted(msg.sender, _taskId);

    }

    function deleteTask(uint _taskId) public {
        require(_taskId < userTasks[msg.sender].length, "Invalid task id");

        uint lastIndex = userTasks[msg.sender].length - 1;
        userTasks[msg.sender][_taskId] = userTasks[msg.sender][lastIndex];
        userTasks[msg.sender].pop();

        emit TaskDeleted(msg.sender, _taskId);

    }

    function getTasks() public view returns (Task[] memory){
        return userTasks[msg.sender];
    }

}


