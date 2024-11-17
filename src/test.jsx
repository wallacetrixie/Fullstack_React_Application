import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Test = () => {
  const [name, setName] = useState('');
  const [fetchedName, setFetchedName] = useState('');

  // Function to handle submission
  const handleSubmit = async () => {
    if (name.trim() === '') return alert('Please enter a name');
    try {
      await axios.post('http://localhost:5000/add-name', { name });
      fetchName(); // Fetch the latest name after submitting
    } catch (error) {
      console.error('Error submitting name:', error);
    }
  };

  // Function to fetch the latest name
  const fetchName = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get-name');
      setFetchedName(response.data.name);
    } catch (error) {
      console.error('Error fetching name:', error);
    }
  };

  useEffect(() => {
    fetchName(); // Fetch name on component mount
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>React Node Project</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: '10px', width: '300px' }}
      />
      <br />
      <button
        onClick={handleSubmit}
        style={{ padding: '10px 20px', marginTop: '10px' }}
      >
        Submit
      </button>
      <h2 style={{ marginTop: '20px' }}>
        {fetchedName ? `My name is ${fetchedName}` : 'No name available'}
      </h2>
    </div>
  );
};

export default Test;
