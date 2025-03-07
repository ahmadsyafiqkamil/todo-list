// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "src/Note.sol";

contract NoteTest is Test {
    Note private note;
    address private user;

    function setUp() public {
        note = new Note();
        user = address(this); // Menggunakan alamat kontrak pengujian sebagai pengguna
    }

    function testAddTask() public {
        string memory title = "Test Task";
        string memory content = "This is a test task.";
        
        vm.prank(user);
        bool success = note.addTask(content, title);
        assertTrue(success, "Task should be added successfully");
    }

    function testCompleteTask() public {
        string memory title = "Task to Complete";
        string memory content = "Complete this task.";
        
        vm.prank(user);
        note.addTask(content, title);
        
        Note.Task[] memory tasks = note.getTasks();
        uint taskId = tasks[0].id;
        
        vm.prank(user);
        bool success = note.completeTask(taskId);
        assertTrue(success, "Task should be marked as completed");
    }

    function testDeleteTask() public {
        string memory title = "Task to Delete";
        string memory content = "Delete this task.";
        
        vm.prank(user);
        note.addTask(content, title);
        
        Note.Task[] memory tasks = note.getTasks();
        uint taskId = tasks[0].id;
        
        vm.prank(user);
        bool success = note.deleteTask(taskId);
        assertTrue(success, "Task should be deleted successfully");
    }

    function testUpdateTask() public {
        string memory title = "Original Title";
        string memory content = "Original Content";
        string memory newTitle = "Updated Title";
        string memory newContent = "Updated Content";
        
        vm.prank(user);
        note.addTask(content, title);
        
        Note.Task[] memory tasks = note.getTasks();
        uint taskId = tasks[0].id;
        
        vm.prank(user);
        bool success = note.updateTask(taskId, newTitle, newContent);
        assertTrue(success, "Task should be updated successfully");
    }

    function testFailCompleteNonExistentTask() public {
        vm.prank(user);
        note.completeTask(99999); // Task ID yang tidak ada, harus gagal
    }

    function testFailDeleteNonExistentTask() public {
        vm.prank(user);
        note.deleteTask(99999); // Task ID yang tidak ada, harus gagal
    }

    function testFailUpdateNonExistentTask() public {
        vm.prank(user);
        note.updateTask(99999, "New Title", "New Content"); // Task ID yang tidak ada, harus gagal
    }
}
