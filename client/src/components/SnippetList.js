import React from 'react';
import SnippetItem from './SnippetItem';

const SnippetList = ({ snippets, deleteSnippet }) => {
  return (
    <div className="snippet-list">
      <h2>Your Snippets</h2>
      {snippets.length === 0 ? (
        <p className="no-snippets">No snippets yet. Add one!</p>
      ) : (
        snippets.map((snippet) => (
          <SnippetItem 
            key={snippet._id} 
            snippet={snippet} 
            deleteSnippet={deleteSnippet}
          />
        ))
      )}
    </div>
  );
};

export default SnippetList;
