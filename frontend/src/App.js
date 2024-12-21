// Import required libraries
import React, { useState } from 'react';
import './App.css'; // Assuming you have some basic styling

// Main App Component
function App() {
  const [tasks, setTasks] = useState([]); // State to store tasks
  const [taskInput, setTaskInput] = useState({
    name: '',
    deadline: '',
    estimatedTime: ''
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskInput({ ...taskInput, [name]: value });
  };

  // Add a new task
  const addTask = () => {
    if (taskInput.name && taskInput.deadline && taskInput.estimatedTime) {
      setTasks([...tasks, taskInput]);
      setTaskInput({ name: '', deadline: '', estimatedTime: '' });
    } else {
      alert('Please fill out all fields.');
    }
  };

  // Render the component
  return (
      <div className="app-container">
        <h1>Todo List</h1>
        <div className="task-input">
          <input
              type="text"
              name="name"
              placeholder="Task Name"
              value={taskInput.name}
              onChange={handleInputChange}
          />
          <input
              type="date"
              name="deadline"
              value={taskInput.deadline}
              onChange={handleInputChange}
          />
          <input
              type="number"
              name="estimatedTime"
              placeholder="Estimated Time (hours)"
              value={taskInput.estimatedTime}
              onChange={handleInputChange}
          />
          <button onClick={addTask}>Add Task</button>
        </div>
        <div className="task-list">
          {tasks.map((task, index) => (
              <div key={index} className="task-item">
                <h3>{task.name}</h3>
                <p>Deadline: {task.deadline}</p>
                <p>Estimated Time: {task.estimatedTime} hours</p>
              </div>
          ))}
        </div>
      </div>
  );
}

export default App;
