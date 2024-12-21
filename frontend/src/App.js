import React, { useState, useEffect } from 'react';
import './App.css'; // Assuming you have some basic styling

function App() {
  const [tasks, setTasks] = useState([]); // State to store tasks
  const [taskInput, setTaskInput] = useState({
    name: '',
    deadline: '',
    estimatedTime: ''
  });
  const [filter, setFilter] = useState(''); // State to store the filter

  // Récupérer les tâches depuis le backend au démarrage
  useEffect(() => {
    fetch('http://localhost:5000/tasks')
        .then((response) => response.json())
        .then((data) => {
          setTasks(data);  // Mettre les tâches récupérées dans l'état
        })
        .catch((error) => console.error('Error fetching tasks:', error));
  }, []); // Le tableau vide [] assure que cette requête se fait uniquement une fois, au démarrage

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskInput({ ...taskInput, [name]: value });
  };

  // Ajouter une nouvelle tâche
  const addTask = () => {
    if (taskInput.name && taskInput.deadline && taskInput.estimatedTime) {
      fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskInput),
      })
          .then((response) => response.json())
          .then((newTask) => {
            setTasks([...tasks, newTask]);  // Ajouter la nouvelle tâche à l'état
            setTaskInput({ name: '', deadline: '', estimatedTime: '' });
          })
          .catch((error) => console.error('Error creating task:', error));
    } else {
      alert('Please fill out all fields.');
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (taskId) => {
    const confirmation = window.confirm('Voulez-vous vraiment supprimer cette tâche ?');
    if (confirmation) {
      try {
        const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Tâche supprimée avec succès');
          // Met à jour la liste des tâches après suppression
          setTasks(tasks.filter((task) => task.id !== taskId));
        } else {
          alert('Erreur lors de la suppression de la tâche');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression de la tâche');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    return date.toLocaleDateString('fr-FR', options);  // Format "01 janvier 2025"
  };


  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (!filter) return true;
    if (filter === 'date') {
      return task.deadline >= new Date().toISOString().split('T')[0];
    } else if (filter === 'time') {
      return parseInt(task.estimatedTime) <= 4; // Example filter for short tasks
    }
    return true;
  });

  return (
      <div className="app-container">
        <header className="app-header">
          <h1>Todo List</h1>
        </header>

        <div className="content">
          <div className="left-column">
            <div className="task-input">
              <input
                  type="text"
                  name="name"
                  placeholder="🖋️ Task Name"
                  value={taskInput.name}
                  onChange={handleInputChange}
                  className="input-field"
              />
              <input
                  type="date"
                  name="deadline"
                  value={taskInput.deadline}
                  onChange={handleInputChange}
                  className="input-field"
              />
              <input
                  type="number"
                  name="estimatedTime"
                  placeholder="⌚ Estimated Time (hours)"
                  value={taskInput.estimatedTime}
                  onChange={handleInputChange}
                  className="input-field"
              />
              <button onClick={addTask} className="add-button">Add Task</button>
            </div>

            <div className="filters">
              <button onClick={() => setFilter('date')} className="filter-button">Filter by Date</button>
              <button onClick={() => setFilter('time')} className="filter-button">Filter by Time</button>
              <button onClick={() => setFilter('')} className="filter-button">Clear Filters</button>
            </div>

            <div className="task-list">
              {filteredTasks.map((task, index) => (
                  <div key={task.id} className="task-item">
                    <h3 className="task-title">{task.name}</h3>
                    <p className="task-deadline">Deadline: {formatDate(task.deadline)}</p>
                    <p className="task-time">Estimated Time: {task.estimatedTime} hours</p>
                    <button onClick={() => handleDeleteTask(task.id)} className="delete-button">❌</button>
                  </div>
              ))}
            </div>
          </div>

          <div className="right-column">
            <h2>Weekly Agenda</h2>
            <div className="agenda">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = new Date();
                day.setDate(day.getDate() + dayIndex);
                const dayTasks = tasks.filter((task) => task.deadline === day.toISOString().split('T')[0]);
                return (
                    <div key={dayIndex} className="agenda-column">
                      <h3>{day.toDateString()}</h3>
                      {dayTasks.length ? (
                          dayTasks.map((task, index) => (
                              <p key={index}>{task.name}</p>
                          ))
                      ) : (
                          <p>No tasks</p>
                      )}
                    </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;
