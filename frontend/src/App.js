import React, { useState, useEffect } from 'react';
import './App.css'; // En supposant que tu as un style de base

function App() {
  const [tasks, setTasks] = useState([]); // État pour stocker les tâches
  const [taskInput, setTaskInput] = useState({
    name: '',
    deadline: '',
    estimatedTime: ''
  });
  const [filter, setFilter] = useState(''); // État pour stocker le filtre
  const [currentWeek, setCurrentWeek] = useState(new Date()); // État pour suivre la semaine actuelle
  const [isLoggedIn, setIsLoggedIn] = useState(false); // État pour vérifier si l'utilisateur est connecté
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || ''); // Récupérer le token de login

  // Vérification du token au démarrage
  useEffect(() => {
    if (token) {
      if (checkTokenExpiration(token)) {
        setIsLoggedIn(true);
        fetchTasks();
      } else {
        handleLogout();
        window.location.reload();  // Rafraîchit la page après expiration du token
      }
    }
  }, [token]);

  const checkTokenExpiration = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Décodage du payload du JWT
      const expirationTime = payload.exp * 1000; // expirationTime en millisecondes
      const currentTime = Date.now();

      return currentTime < expirationTime;
    } catch (error) {
      return false; // Si le token n'est pas valide ou s'il n'y a pas de date d'expiration, on considère qu'il est invalide
    }
  };

  // Récupérer les tâches depuis le backend
  const fetchTasks = () => {
    fetch('http://localhost:5000/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setTasks(data); // Assurez-vous que la réponse est bien un tableau
          } else {
            console.error('Les tâches reçues ne sont pas un tableau');
          }
        })
        .catch((error) => console.error('Erreur lors de la récupération des tâches :', error));
  };

  // Gérer les changements dans les champs de saisie
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskInput),
      })
          .then((response) => response.json())
          .then((newTask) => {
            setTasks((prevTasks) => [...prevTasks, newTask]); // Ajouter la nouvelle tâche à l'état
            setTaskInput({ name: '', deadline: '', estimatedTime: '' });
          })
          .catch((error) => console.error('Erreur lors de la création de la tâche :', error));
    } else {
      alert('Veuillez remplir tous les champs.');
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (taskId) => {
    const confirmation = window.confirm('Voulez-vous vraiment supprimer cette tâche ?');
    if (confirmation) {
      try {
        const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          alert('Tâche supprimée avec succès');
          // Met à jour la liste des tâches après suppression
          setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        } else {
          alert('Erreur lors de la suppression de la tâche');
        }
      } catch (error) {
        console.error('Erreur :', error);
        alert('Erreur lors de la suppression de la tâche');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    return date.toLocaleDateString('fr-FR', options);  // Format "01 janvier 2025"
  };

  // Calculer la semaine actuelle à partir de la date de référence
  const getWeekDays = (date) => {
    const firstDayOfWeek = date.getDate() - date.getDay(); // Premier jour de la semaine (dimanche)
    const weekStart = new Date(date.setDate(firstDayOfWeek));
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  // Filtrer les tâches en fonction de la semaine actuelle
  const getTasksForWeek = (weekDays) => {
    return weekDays.map((day) => {
      // Filtrer les tâches dont la deadline correspond à ce jour précis
      return tasks.filter((task) => {
        const taskDeadline = new Date(task.deadline);
        // Comparer uniquement l'année, le mois et le jour
        return taskDeadline.toISOString().split('T')[0] === day.toISOString().split('T')[0];
      });
    });
  };

  // Changer de semaine
  const changeWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + direction * 7); // Décalage d'une semaine
    setCurrentWeek(newDate);
  };

  const weekDays = getWeekDays(currentWeek);
  const weekTasks = getTasksForWeek(weekDays);

  // Connexion de l'utilisateur
  const handleLogin = () => {
    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
        .then((response) => {
          if (!response.ok) {
            // Si la réponse n'est pas OK (status 2xx), on lance une erreur
            throw new Error('Identifiants incorrects');
          }
          return response.json();
        })
        .then((data) => {
          if (data.token) {
            setToken(data.token);
            localStorage.setItem('token', data.token);  // Stocke le token dans le localStorage
            setIsLoggedIn(true);
            fetchTasks(); // Récupérer les tâches après la connexion
          } else {
            alert('Token non reçu');
          }
        })
        .catch((error) => {
          console.error('Erreur lors de la connexion :', error);
          alert(error.message); // Afficher le message d'erreur à l'utilisateur
        });
  };

  // Déconnexion de l'utilisateur
  const handleLogout = () => {
    localStorage.removeItem('token');  // Supprimer le token du localStorage
    setIsLoggedIn(false);
    setToken('');
  };

  return (
      <div className="app-container">
        <header className="app-header">
          <h1>Liste des Tâches</h1>
        </header>

        {!isLoggedIn ? (
            <div className="login-container">
              <h2>Se connecter</h2>
              <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
              />
              <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={handleLogin}>Se connecter</button>
            </div>
        ) : (
            <div className="content">
              <div className="left-column">
                <div className="task-input">
                  <input
                      type="text"
                      name="name"
                      placeholder="🖋️ Nom de la tâche"
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
                      placeholder="⌚ Temps estimé (en heures)"
                      value={taskInput.estimatedTime}
                      onChange={handleInputChange}
                      className="input-field"
                  />
                  <button onClick={addTask} className="add-button">Ajouter une tâche</button>
                </div>

                <div className="filters">
                  <button onClick={() => setFilter('date')} className="filter-button">Filtrer par date</button>
                  <button onClick={() => setFilter('time')} className="filter-button">Filtrer par temps</button>
                  <button onClick={() => setFilter('')} className="filter-button">Effacer les filtres</button>
                </div>

                <div className="task-list">
                  {tasks.map((task) => (
                      <div key={task.id} className="task-item">
                        <h3 className="task-title">{task.name}</h3>
                        <p className="task-deadline">Deadline : {formatDate(task.deadline)}</p>
                        <p className="task-time">Temps estimé : {task.estimatedTime}h</p>
                        <button onClick={() => handleDeleteTask(task.id)} className="delete-button">Supprimer</button>
                      </div>
                  ))}
                </div>

                <button onClick={handleLogout} className="logout-button">Déconnexion</button>
              </div>

              <div className="right-column">
                <h2>Semaine actuelle</h2>
                <div className="week-navigation">
                  <button onClick={() => changeWeek(-1)}>Précédente</button>
                  <span>{currentWeek.toLocaleDateString()}</span>
                  <button onClick={() => changeWeek(1)}>Suivante</button>
                </div>
                <div className="week-tasks">
                  {weekTasks.map((dayTasks, index) => (
                      <div key={index}>
                        <h3>Jour {index + 1}</h3>
                        <ul>
                          {dayTasks.map((task) => (
                              <li key={task.id}>
                                {task.name} - {task.estimatedTime}h
                              </li>
                          ))}
                        </ul>
                      </div>
                  ))}
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default App;
