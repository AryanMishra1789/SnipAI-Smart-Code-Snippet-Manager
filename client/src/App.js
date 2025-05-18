import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SnippetForm from './components/SnippetForm';
import SnippetList from './components/SnippetList';
import './App.css';

function App() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API URL - dynamically set based on environment and deployment platform
  const getApiUrl = () => {
    // Development environment
    if (process.env.NODE_ENV !== 'production') {
      return 'http://localhost:5000/api/snippets';
    }
    
    // For Netlify deployment with separate backend
    const netlifyBackendUrl = process.env.REACT_APP_BACKEND_URL;
    if (netlifyBackendUrl) {
      return `${netlifyBackendUrl}/api/snippets`;
    }
    
    // Default for Railway, Vercel or other platforms that serve both frontend and backend
    return '/api/snippets';
  };
  
  const API_URL = getApiUrl();

  // Fetch snippets from API
  const fetchSnippets = async () => {
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSnippets(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Add a new snippet
  const addSnippet = async (snippetData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snippetData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSnippets([data, ...snippets]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a snippet
  const deleteSnippet = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      setSnippets(snippets.filter(snippet => snippet._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch snippets on component mount
  useEffect(() => {
    fetchSnippets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="app">
      <Header />
      <div className="container main-content">
        <div className="grid">
          <div className="form-section">
            <SnippetForm addSnippet={addSnippet} />
          </div>
          <div className="list-section">
            <SnippetList snippets={snippets} deleteSnippet={deleteSnippet} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
