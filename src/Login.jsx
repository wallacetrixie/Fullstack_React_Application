import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Login.css';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // useNavigate for route redirection

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/register' : '/login';

    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        username,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token); // Store the token
        navigate('/tasks'); // Redirect to tasks page
      } else {
        setError(response.data.message || 'Invalid username or password. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="form-container">
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
          {error && <p className="error">{error}</p>}
          <p onClick={toggleAuthMode} className="toggle-link">
            {isRegister ? 'Already have an account? Login' : 'No account? Register'}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
