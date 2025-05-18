import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import SimilarSnippets from './SimilarSnippets';

const SnippetItem = ({ snippet, deleteSnippet }) => {
  const { _id, title, code, language, description, tags, aiTags, explanation } = snippet;
  const [similarSnippets, setSimilarSnippets] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const codeRef = useRef(null);
    // State to track whether to search online
  const [searchOnline, setSearchOnline] = useState(false);
  
  // Fetch similar snippets
  const fetchSimilarSnippets = async (searchWeb = false) => {
    try {
      setSearchOnline(searchWeb);
      setLoadingSimilar(true);
      const response = await fetch(`/api/snippets/${_id}/similar${searchWeb ? '?searchOnline=true' : ''}`);
      if (response.ok) {
        const data = await response.json();
        setSimilarSnippets(data);
      }
    } catch (error) {
      console.error('Error fetching similar snippets:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };
    useEffect(() => {
    // Apply syntax highlighting when component mounts or code changes
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
    
    // Fetch similar snippets when the component mounts
    fetchSimilarSnippets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id, code, language]);

  return (
    <div className="snippet-item">
      <div className="snippet-header">
        <h3>{title}</h3>
        <span className="language-badge">{language}</span>
      </div>
      
      <div className="code-container">
        <pre className="code-block">
          <code ref={codeRef} className={language}>
            {code}
          </code>
        </pre>
      </div>
      
      {description && (
        <div className="description">
          <p>{description}</p>
        </div>
      )}
      
      <div className="tags-container">
        {tags.length > 0 && (
          <div className="tags-section">
            <strong>Tags:</strong>
            <div className="tags">
              {tags.map((tag, index) => (
                <span key={`tag-${index}`} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
        
        {aiTags && aiTags.length > 0 && (
          <div className="tags-section">
            <strong>AI Tags:</strong>
            <div className="tags">
              {aiTags.map((tag, index) => (
                <span key={`ai-tag-${index}`} className="ai-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {explanation && (
        <div className="explanation">
          <h4>AI Explanation:</h4>
          <p>{explanation}</p>
        </div>
      )}
        <div className="similar-snippets-container">
        {loadingSimilar ? (
          <p>Looking for similar snippets...</p>
        ) : (
          <SimilarSnippets snippets={similarSnippets} />
        )}
      </div>
        <div className="snippet-actions">
        <button 
          className="btn delete-btn" 
          onClick={() => deleteSnippet(_id)}
        >
          Delete
        </button>
        <button 
          className="btn refresh-btn" 
          onClick={() => fetchSimilarSnippets(false)}
        >
          Find Similar (Local)
        </button>
        <button 
          className="btn web-search-btn" 
          onClick={() => fetchSimilarSnippets(true)}
          title="Search for similar snippets across the web"
        >
          {loadingSimilar && searchOnline ? 'Searching...' : 'Search Web'}
        </button>
      </div>
    </div>
  );
};

export default SnippetItem;
