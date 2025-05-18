const express = require('express');
const router = express.Router();
const Snippet = require('../models/Snippet');
const { findSimilarSnippetsOnline } = require('../services/externalSearchService');

// GET all snippets
router.get('/', async (req, res) => {
  try {
    // Initialize mock database with sample data if empty
    if (!global.mockDB || !global.mockDB.snippets || global.mockDB.snippets.length === 0) {
      global.mockDB = {
        snippets: [
          {
            _id: '1',
            title: 'React useState Hook Example',
            code: 'const [count, setCount] = useState(0);\n\nconst increment = () => {\n  setCount(prevCount => prevCount + 1);\n};',
            language: 'javascript',
            description: 'Simple counter using React useState hook',
            tags: ['react', 'hooks', 'state'],
            aiTags: ['function', 'react', 'hook'],
            explanation: 'This code implements a counter using React\'s useState hook. It initializes a state variable "count" with value 0 and a function "setCount" to update it.',
            createdAt: new Date()
          },
          {
            _id: '2',
            title: 'Python List Comprehension',
            code: 'squares = [x**2 for x in range(10) if x % 2 == 0]',
            language: 'python',
            description: 'Creating a list of squares of even numbers from 0 to 9',
            tags: ['list', 'comprehension'],
            aiTags: ['list', 'loop', 'algorithm'],
            explanation: 'This code creates a list of squares of all even numbers from 0 to 9 using Python\'s list comprehension syntax.',
            createdAt: new Date()
          }
        ]
      };
    }
    
    res.json(global.mockDB.snippets || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single snippet
router.get('/:id', async (req, res) => {  try {
    // For hackathon demo, we'll use our mock database instead of MongoDB
    const snippet = global.mockDB.snippets.find(s => s._id === req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET similar snippets for a snippet
router.get('/:id/similar', async (req, res) => {
  try {
    // Find snippet in our mock database
    const snippet = global.mockDB.snippets.find(s => s._id === req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    
    // Include the searchOnline query parameter to control whether to search online
    const searchOnline = req.query.searchOnline === 'true';
    
    // Find similar local snippets
    const localSimilarSnippets = findSimilarSnippets(snippet);
    
    if (!searchOnline) {
      // If online search is not requested, return only local results
      return res.json(localSimilarSnippets);
    }
    
    try {
      // Find similar online snippets
      const onlineSnippets = await findSimilarSnippetsOnline(snippet);
      
      // Combine local and online results, limiting to 6 total (3 from each source)
      const combinedResults = [
        ...localSimilarSnippets.slice(0, 3),
        ...onlineSnippets.slice(0, 3)
      ];
      
      // Sort by similarity score
      combinedResults.sort((a, b) => b.similarityScore - a.similarityScore);
      
      res.json(combinedResults);
    } catch (onlineError) {
      // If online search fails, fall back to local results
      console.error('Error searching online, falling back to local results:', onlineError);
      res.json(localSimilarSnippets);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new snippet
router.post('/', async (req, res) => {
  const { title, code, language, description, tags } = req.body;
  
  if (!title || !code || !language) {
    return res.status(400).json({ message: 'Please provide title, code, and language' });
  }
  
  // In a real app, this is where we would call the AI service to generate tags and explanation
  // For now, we'll mock this functionality
  const mockAiTags = generateMockAiTags(code, language);
  const mockExplanation = generateMockExplanation(code, language);
  
  // For hackathon demo, we'll use our mock database instead of MongoDB
  const newSnippet = {
    _id: Date.now().toString(), // Simple ID generation
    title,
    code,
    language,
    description: description || '',
    tags: tags || [],
    aiTags: mockAiTags,
    explanation: mockExplanation,
    createdAt: new Date()
  };
  
  try {
    // Initialize snippets array if it doesn't exist
    if (!global.mockDB.snippets) {
      global.mockDB.snippets = [];
    }
    
    // Add the new snippet to our mock database
    global.mockDB.snippets.unshift(newSnippet);
    res.status(201).json(newSnippet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a snippet
router.patch('/:id', async (req, res) => {
  try {
    // For hackathon demo, we'll use our mock database instead of MongoDB
    const index = global.mockDB.snippets.findIndex(s => s._id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    
    // Update the snippet in our mock database
    Object.keys(req.body).forEach(key => {
      global.mockDB.snippets[index][key] = req.body[key];
    });
    
    res.json(global.mockDB.snippets[index]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a snippet
router.delete('/:id', async (req, res) => {
  try {
    // For hackathon demo, we'll use our mock database instead of MongoDB
    const index = global.mockDB.snippets.findIndex(s => s._id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    
    // Remove the snippet from our mock database
    global.mockDB.snippets.splice(index, 1);
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mock functions to simulate AI functionality
function generateMockAiTags(code, language) {
  // In a real app, we would use OpenAI or another service to analyze the code
  const commonTags = {
    javascript: ['function', 'array', 'object', 'loop'],
    python: ['function', 'list', 'dictionary', 'loop'],
    java: ['class', 'method', 'collection', 'loop'],
    csharp: ['class', 'method', 'collection', 'LINQ'],
    html: ['div', 'form', 'input', 'structure'],
    css: ['style', 'layout', 'responsive', 'animation']
  };
  
  // Get tags for the specified language, or use generic tags
  const languageTags = commonTags[language.toLowerCase()] || ['syntax', 'code', 'algorithm'];
  
  // Randomly select 2-3 tags
  return languageTags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2);
}

function generateMockExplanation(code, language) {
  // In a real app, we would use OpenAI or Gemini API to explain the code
  
  // For database connection files
  if (code.includes('mongoose') && code.includes('connectDB')) {
    return `Establishes a MongoDB database connection using Mongoose ODM. Includes error handling and environment variable configuration. Uses a singleton pattern for connection management.`;
  }
  
  // For React hooks
  if (code.includes('useState') && (code.includes('setCount') || code.includes('setState') || code.includes('set'))) {
    const stateVarMatch = code.match(/const\s+\[\s*(\w+)\s*,\s*set(\w+)\s*\]\s*=\s*useState/);
    const stateVar = stateVarMatch ? stateVarMatch[1] : 'state';
    const initialValueMatch = code.match(/useState\(([^)]+)\)/);
    const initialValue = initialValueMatch ? initialValueMatch[1] : '0';
    
    return `Creates a React state variable '${stateVar}' with initial value ${initialValue}. Provides a setter function for state updates. ${code.includes('prev') ? 'Uses functional updates for handling previous state values.' : ''}`;
  }
  
  // For array methods (map, filter, reduce)
  if (language === 'javascript' && (code.includes('.map(') || code.includes('.filter(') || code.includes('.reduce('))) {
    let methods = [];
    if (code.includes('.map(')) methods.push('map');
    if (code.includes('.filter(')) methods.push('filter');
    if (code.includes('.reduce(')) methods.push('reduce');
    
    return `Uses JavaScript's ${methods.join(', ')} ${methods.length > 1 ? 'methods' : 'method'} for functional array transformation. ${code.includes('=>') ? 'Implements arrow functions for concise callbacks.' : ''} ${!code.includes('var ') ? 'Follows immutability principles.' : ''}`;
  }
  
  // For Python list comprehension
  if (language === 'python' && (code.includes('[') && code.includes('for') && code.includes('in'))) {
    let compType = "list comprehension";
    if (code.includes('{') && code.includes(':')) compType = "dictionary comprehension";
    else if (code.includes('(') && code.includes('for') && !code.includes('[')) compType = "generator expression";
    
    return `Implements Python ${compType} for concise collection creation. ${code.includes('if') ? 'Includes conditional filtering of elements.' : ''} ${code.includes('range') ? 'Uses range() function to generate a sequence.' : ''} Creates a new collection without modifying the original data.`;
  }
  
  // For JavaScript Promises/async-await
  if (language === 'javascript' && (code.includes('async') || code.includes('await') || code.includes('Promise'))) {
    return `Manages asynchronous operations using ${code.includes('async') ? 'modern async/await syntax' : 'Promise-based patterns'}. ${code.includes('try') && code.includes('catch') ? 'Includes error handling with try/catch.' : ''} ${code.includes('Promise.all') ? 'Uses Promise.all for parallel execution.' : ''}`;
  }
  
  // For React components
  if (language === 'javascript' && code.includes('React') && (code.includes('function') || code.includes('class')) && (code.includes('return') && code.includes('<'))) {
    const isClass = code.includes('class') && code.includes('extends');
    const hasState = code.includes('useState') || (isClass && code.includes('this.state'));
    const hasEffect = code.includes('useEffect') || (isClass && (code.includes('componentDidMount') || code.includes('componentDidUpdate')));
    
    return `Defines a ${isClass ? 'class-based' : 'functional'} React component that renders UI elements. ${hasState ? `Manages component state using ${isClass ? 'this.state' : 'useState hook'}.` : ''} ${hasEffect ? `Handles side effects with ${isClass ? 'lifecycle methods' : 'useEffect hook'}.` : ''} ${code.includes('map(') ? 'Renders lists using array mapping.' : ''}`;
  }
  
  // CSS analysis
  if (language === 'css' || language === 'scss') {
    const hasFlexbox = code.includes('display: flex') || code.includes('display:flex');
    const hasGrid = code.includes('display: grid') || code.includes('display:grid');
    const hasMedia = code.includes('@media');
    
    return `Defines CSS styling for web elements. ${hasFlexbox ? 'Uses Flexbox for layout.' : ''} ${hasGrid ? 'Implements CSS Grid system.' : ''} ${hasMedia ? 'Includes responsive design with media queries.' : ''} ${code.includes('var(--') ? 'Uses CSS variables for theme consistency.' : ''}`;
  }
    // Python function analysis
  if (language === 'python' && code.includes('def ')) {
    // Extract function name
    const functionMatches = code.match(/def\s+(\w+)\s*\(/);
    const functionName = functionMatches ? functionMatches[1] : 'function';
    
    // Check for specific libraries and their usages
    if (code.includes('whisper') && code.includes('transcribe')) {
      return `Converts audio/video speech to text using OpenAI's Whisper model. Takes a ${code.includes('video_path') ? 'video file path' : 'audio/video input'} and returns transcribed text. ${code.includes('translate') ? 'Also translates non-English content to English.' : ''}`;
    }
    
    if (code.includes('pandas') || code.includes('pd.')) {
      return `Performs data manipulation using Pandas library. ${functionName.includes('analyze') || functionName.includes('process') ? 'Analyzes and transforms data.' : 'Handles data frames or series operations.'} ${code.includes('read_') ? 'Imports data from external sources.' : ''} ${code.includes('plot') || code.includes('fig') ? 'Includes data visualization.' : ''}`;
    }
    
    if (code.includes('numpy') || code.includes('np.')) {
      return `Implements numerical computing operations using NumPy. ${code.includes('array') ? 'Works with array data structures.' : ''} ${code.includes('random') ? 'Includes randomization or statistical functions.' : ''} ${code.includes('linalg') ? 'Performs linear algebra operations.' : ''}`;
    }
    
    if (code.includes('requests.') || code.includes('requests ')) {
      return `Makes HTTP requests to web services or APIs. ${code.includes('.json()') ? 'Processes JSON responses from web requests.' : ''} ${code.includes('headers') ? 'Uses custom headers in the requests.' : ''} ${code.includes('auth') ? 'Implements authentication for API access.' : ''}`;
    }
    
    // Enhanced general Python function description
    return `Defines ${code.match(/def\s+(\w+)/g).length > 1 ? 'multiple Python functions' : `the '${functionName}' function`} that ${code.includes('return') ? 'processes data and returns results.' : 'performs operations.'} ${code.includes('import') ? 'Uses external libraries for extended functionality.' : ''} ${code.includes('"""') || code.includes("'''") ? 'Includes docstring documentation.' : ''} ${code.includes('except') ? 'Implements exception handling.' : ''}`;
  }
  
  // For HTML documents
  if (language === 'html' || code.includes('<!DOCTYPE html>') || (code.includes('<html') && code.includes('<body'))) {
    return `Defines HTML structure for a web page. ${code.includes('<head>') ? 'Includes metadata in head section.' : ''} ${code.includes('<div') ? 'Uses div containers for layout.' : ''} ${code.includes('<header') || code.includes('<nav') || code.includes('<footer') ? 'Implements semantic HTML elements.' : ''} ${code.includes('<form') ? 'Contains forms for user input.' : ''}`;
  }
  
  // JSON/Configuration file analysis
  if ((language === 'json' || code.includes('{') && code.includes(':') && !code.includes('function')) && !code.includes('=>')) {
    return `Defines a ${language === 'json' ? 'JSON data structure' : 'configuration object'} with ${code.split('\n').length < 10 ? 'simple' : 'nested'} properties. ${code.includes('dependencies') ? 'Lists package dependencies.' : ''} ${code.includes('scripts') ? 'Defines runnable commands.' : ''} ${code.includes('version') ? 'Specifies version information.' : ''}`;
  }
  
  // Generic fallback explanations based on language
  const explanations = {
    javascript: `Implements JavaScript code ${code.includes('function') ? 'with defined functions' : code.includes('class') ? 'using object-oriented structure' : 'for data manipulation'}. ${code.includes('const') || code.includes('let') ? 'Uses modern ES6+ syntax.' : ''} ${code.includes('import') || code.includes('export') ? 'Utilizes JavaScript module system.' : ''}`,
    
    python: `Implements Python ${code.includes('class') ? 'object-oriented' : code.includes('def ') ? 'function-based' : 'procedural'} code. ${code.includes('import') ? 'Imports external libraries.' : ''} ${code.includes('if __name__ ==') ? 'Includes proper module execution control.' : ''}`,
    
    java: `Defines Java code with ${code.includes('class') ? 'object-oriented structure' : 'fundamental syntax'}. ${code.includes('public static void main') ? 'Includes application entry point.' : ''} ${code.includes('extends') ? 'Uses inheritance hierarchy.' : ''}`,
    
    html: `Creates HTML markup for web page structure. ${code.includes('class=') ? 'Uses CSS classes for styling.' : ''} ${code.includes('<form') ? 'Implements form elements for user input.' : ''}`,
    
    css: `Defines CSS styling for visual presentation. ${code.includes('@media') ? 'Implements responsive design.' : ''} ${code.includes('@keyframes') ? 'Contains animations.' : ''}`
  };
  
  return explanations[language.toLowerCase()] || `Implements ${language} code with standard ${language} syntax and practices. ${code.includes('function') || code.includes('def ') ? 'Contains reusable code blocks.' : ''} ${code.includes('import') || code.includes('include') ? 'References external libraries.' : ''}`;
}

// Find similar snippets based on language, tags or content
function findSimilarSnippets(currentSnippet) {
  if (!global.mockDB || !global.mockDB.snippets) {
    return [];
  }
  
  const { _id, language, tags, aiTags, code } = currentSnippet;
  
  // Calculate a simple similarity score based on matching tags and language
  return global.mockDB.snippets
    .filter(snippet => snippet._id !== _id) // Don't include the current snippet
    .map(snippet => {
      // Start with a base score
      let score = 0;
      
      // Same language is a strong indicator of similarity
      if (snippet.language === language) {
        score += 30;
      }
      
      // Count matching user-provided tags
      const matchingTags = tags.filter(tag => snippet.tags.includes(tag));
      score += matchingTags.length * 10;
      
      // Count matching AI-generated tags
      const matchingAiTags = aiTags.filter(tag => snippet.aiTags.includes(tag));
      score += matchingAiTags.length * 15;
      
      // Simple content similarity based on code length
      // In a real app, we would use embeddings or semantic similarity
      const lengthDifference = Math.abs(snippet.code.length - code.length);
      if (lengthDifference < 50) score += 10;
      
      return {
        ...snippet,
        similarityScore: score
      };
    })
    .filter(snippet => snippet.similarityScore > 20) // Only return snippets with enough similarity
    .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity score
    .slice(0, 3); // Return top 3 similar snippets
}

module.exports = router;
