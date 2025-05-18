import React, { useState } from 'react';

const SnippetForm = ({ addSnippet }) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    language: 'javascript',
    description: '',
    tags: ''
  });

  const { title, code, language, description, tags } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!title || !code || !language) {
      alert('Please add a title, code, and select a language');
      return;
    }

    // Convert tags string to array
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    // Submit
    addSnippet({
      title,
      code,
      language,
      description,
      tags: tagsArray
    });

    // Clear form
    setFormData({
      title: '',
      code: '',
      language: 'javascript',
      description: '',
      tags: ''
    });
  };

  return (
    <div className="snippet-form-container">
      <h2>Add New Snippet</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={onChange}
            placeholder="Snippet title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select name="language" value={language} onChange={onChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
            <option value="swift">Swift</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="code">Code</label>
          <textarea
            name="code"
            value={code}
            onChange={onChange}
            placeholder="Paste your code here"
            rows="8"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            name="description"
            value={description}
            onChange={onChange}
            placeholder="Describe what this code does"
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="tags">Tags (Comma separated)</label>
          <input
            type="text"
            name="tags"
            value={tags}
            onChange={onChange}
            placeholder="e.g., function, array, loop"
          />
        </div>
        
        <button type="submit" className="btn">Save Snippet</button>
      </form>
    </div>
  );
};

export default SnippetForm;
