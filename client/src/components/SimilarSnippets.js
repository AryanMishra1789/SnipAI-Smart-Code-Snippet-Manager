import React, { useState, useEffect, useRef } from 'react';
import hljs from 'highlight.js';

const SimilarSnippets = ({ snippets }) => {
  const [expandedSnippet, setExpandedSnippet] = useState(null);
  const [groupView, setGroupView] = useState('all'); // 'all', 'local', or 'web'
  const codeRefs = useRef({});
  
  useEffect(() => {
    // Apply syntax highlighting to all visible code snippets
    Object.keys(codeRefs.current).forEach(id => {
      if (codeRefs.current[id]) {
        hljs.highlightElement(codeRefs.current[id]);
      }
    });
  }, [snippets, expandedSnippet]);
  
  if (!snippets || snippets.length === 0) {
    return (
      <div className="similar-snippets">
        <h4>Similar Snippets</h4>
        <p>No similar snippets found.</p>
      </div>
    );
  }
  
  // Separate web results from local database results
  const localSnippets = snippets.filter(snippet => !snippet.fromWeb);
  const webSnippets = snippets.filter(snippet => snippet.fromWeb);
  
  // Handler for expanding/collapsing a snippet
  const toggleExpand = (id) => {
    setExpandedSnippet(expandedSnippet === id ? null : id);
  };
  
  // Format code preview with proper line breaks
  const formatCodePreview = (code, isExpanded) => {
    if (!code) return '';
    
    if (isExpanded) {
      return code;
    }
    
    // For collapsed view, show first 2 lines with ellipsis
    const lines = code.split('\n');
    if (lines.length <= 3) {
      return code;
    }
    
    return `${lines.slice(0, 3).join('\n')}...`;
  };
    // Get snippets based on selected view
  const getVisibleSnippets = () => {
    switch(groupView) {
      case 'local':
        return { visible: localSnippets, label: 'From Your Collection' };
      case 'web':
        return { visible: webSnippets, label: 'From Web Results' };
      default:
        // Combine both but keep them separated by category
        return { 
          local: localSnippets, 
          web: webSnippets, 
          localLabel: '', 
          webLabel: 'From Web Results' 
        };
    }
  };

  const snippetGroups = getVisibleSnippets();

  return (
    <div className="similar-snippets">
      <div className="similar-snippets-header">
        <h4>Similar Snippets</h4>
        
        <div className="snippet-filter-tabs">
          <button 
            className={`tab ${groupView === 'all' ? 'active' : ''}`}
            onClick={() => setGroupView('all')}
          >
            All ({localSnippets.length + webSnippets.length})
          </button>
          <button 
            className={`tab ${groupView === 'local' ? 'active' : ''}`}
            onClick={() => setGroupView('local')}
          >
            My Snippets ({localSnippets.length})
          </button>
          <button 
            className={`tab ${groupView === 'web' ? 'active' : ''}`}
            onClick={() => setGroupView('web')}
          >
            Web ({webSnippets.length})
          </button>
        </div>
      </div>
        {groupView === 'all' ? (
        <>
          {localSnippets.length > 0 && (
            <>
              <h5>{snippetGroups.localLabel}</h5>
              <div className="similar-snippets-list">
                {snippetGroups.local.map((snippet) => (
                  <div 
                    key={snippet._id} 
                    className={`similar-snippet-card ${expandedSnippet === snippet._id ? 'expanded' : ''}`}
                    onClick={() => toggleExpand(snippet._id)}
                  >
                    <div className="similar-card-header">
                      <h5>{snippet.title}</h5>
                      <span className="small-language-badge">{snippet.language}</span>
                    </div>
                    <div className={`similar-code-preview ${expandedSnippet === snippet._id ? 'expanded' : ''}`}>
                      <pre>
                        <code 
                          ref={el => codeRefs.current[snippet._id] = el} 
                          className={snippet.language}
                        >
                          {formatCodePreview(snippet.code, expandedSnippet === snippet._id)}
                        </code>
                      </pre>
                    </div>
                    {snippet.tags && snippet.tags.length > 0 && (
                      <div className="similar-tags">
                        {snippet.tags.map((tag, i) => (
                          <span key={i} className="mini-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="similarity-score">
                      <span>Similarity: {snippet.similarityScore}%</span>
                      <span className="expand-collapse">
                        {expandedSnippet === snippet._id ? 'Collapse' : 'Expand'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {webSnippets.length > 0 && (
            <>
              <h5 className="web-results-title">From Around the Web</h5>
              <div className="similar-snippets-list web-results">
                {webSnippets.map((snippet) => (
              <div 
                key={snippet._id} 
                className={`similar-snippet-card web-snippet-card ${expandedSnippet === snippet._id ? 'expanded' : ''}`}
                onClick={() => toggleExpand(snippet._id)}
              >
                <div className="similar-card-header">
                  <h5 className="web-snippet-title" title={snippet.title}>
                    {snippet.title}
                  </h5>
                  <span className="small-language-badge">{snippet.language}</span>
                </div>
                {snippet.source && (
                  <div className="snippet-source">
                    <a 
                      href={snippet.source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="source-icon"></i>
                      {snippet.source.name}
                    </a>
                  </div>
                )}
                <div className={`similar-code-preview ${expandedSnippet === snippet._id ? 'expanded' : ''}`}>
                  <pre>
                    <code 
                      ref={el => codeRefs.current[snippet._id] = el} 
                      className={snippet.language}
                    >
                      {formatCodePreview(snippet.code, expandedSnippet === snippet._id)}
                    </code>
                  </pre>
                </div>
                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="similar-tags">
                    {snippet.tags.map((tag, i) => (
                      <span key={i} className="mini-tag web-tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="similarity-score">
                  <span>Similarity: {snippet.similarityScore}%</span>
                  <span className="expand-collapse">
                    {expandedSnippet === snippet._id ? 'Collapse' : 'Expand'}
                  </span>                </div>
              </div>
            ))}
          </div>
            </>
          )}
        </>
      ) : (
        // For 'local' or 'web' view modes
        <>
          {snippetGroups.visible && snippetGroups.visible.length > 0 ? (
            <>
              <h5>{snippetGroups.label}</h5>
              <div className="similar-snippets-list">
                {snippetGroups.visible.map((snippet) => (
                  <div 
                    key={snippet._id} 
                    className={`similar-snippet-card ${snippet.fromWeb ? 'web-snippet-card' : ''} ${expandedSnippet === snippet._id ? 'expanded' : ''}`}
                    onClick={() => toggleExpand(snippet._id)}
                  >
                    <div className="similar-card-header">
                      <h5>{snippet.title}</h5>
                      <span className="small-language-badge">{snippet.language}</span>
                    </div>
                    {snippet.source && (
                      <div className="snippet-source">
                        <a 
                          href={snippet.source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="source-icon"></i>
                          {snippet.source.name}
                        </a>
                      </div>
                    )}
                    <div className={`similar-code-preview ${expandedSnippet === snippet._id ? 'expanded' : ''}`}>
                      <pre>
                        <code 
                          ref={el => codeRefs.current[snippet._id] = el} 
                          className={snippet.language}
                        >
                          {formatCodePreview(snippet.code, expandedSnippet === snippet._id)}
                        </code>
                      </pre>
                    </div>
                    {snippet.tags && snippet.tags.length > 0 && (
                      <div className="similar-tags">
                        {snippet.tags.map((tag, i) => (
                          <span key={i} className={`mini-tag ${snippet.fromWeb ? 'web-tag' : ''}`}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="similarity-score">
                      <span>Similarity: {snippet.similarityScore}%</span>
                      <span className="expand-collapse">
                        {expandedSnippet === snippet._id ? 'Collapse' : 'Expand'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>No snippets found in this category.</p>
          )}
        </>
      )}
    </div>
  );
};

export default SimilarSnippets;
