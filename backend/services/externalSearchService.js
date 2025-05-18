const axios = require('axios');

// Configuration for external APIs
const API_KEY = process.env.GOOGLE_API_KEY || 'YOUR_GOOGLE_API_KEY';
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID || 'YOUR_SEARCH_ENGINE_ID';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

/**
 * Search for similar code snippets on the web using Google Custom Search API
 * @param {Object} snippet - The snippet object to find similar code for
 * @returns {Promise<Array>} - Array of similar snippets from the web
 */
const findSimilarSnippetsOnline = async (snippet) => {
  try {
    const { language, tags, code } = snippet;
      // Construct search query from snippet attributes
    // First, identify any specific libraries or frameworks in the code
    const libraries = [];
    if (language === 'python') {
      if (code.includes('import whisper')) libraries.push('whisper');
      if (code.includes('import pandas')) libraries.push('pandas');
      if (code.includes('import numpy')) libraries.push('numpy');
      if (code.includes('import tensorflow') || code.includes('import torch')) libraries.push('machine learning');
    } else if (language === 'javascript') {
      if (code.includes('React')) libraries.push('React');
      if (code.includes('useState') || code.includes('useEffect')) libraries.push('React hooks');
      if (code.includes('express')) libraries.push('Express.js');
      if (code.includes('mongoose')) libraries.push('MongoDB');
    }
    
    // Identify function or class purpose
    let purpose = '';
    if (code.includes('transcribe')) purpose = 'transcription';
    if (code.includes('translate')) purpose = 'translation';
    if (code.includes('analyze') || code.includes('process')) purpose = 'data processing';
    if (code.includes('render') || code.includes('return') && code.includes('<')) purpose = 'rendering UI';
    
    const queryTerms = [
      `${language} code ${purpose ? 'for ' + purpose : 'example'}`,
      ...libraries,
      ...tags.slice(0, 2), // Include up to 2 tags
      // Extract significant parts of the code (keywords, function names, etc.)
      ...extractKeywords(code, 2)
    ].filter(Boolean); // Remove empty strings
    
    const searchQuery = queryTerms.join(' ');
    
    // Call Google Custom Search API
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: searchQuery,
        num: 5, // Number of results
        // Filter to code-related sites
        siteSearch: 'github.com,stackoverflow.com,developer.mozilla.org,codepen.io',
        siteSearchFilter: 'i' // include these sites
      }
    });
    
    // Process the search results into a format compatible with our app
    const webResults = await processSearchResults(response.data.items || [], snippet);
    
    return webResults;
    
  } catch (error) {
    console.error('Error searching for similar snippets online:', error);
    return []; // Return empty array in case of error
  }
};

/**
 * Process Google search results and extract code snippets
 * In a production app, this would involve more sophisticated scraping and parsing
 * @param {Array} results - Search results from Google API
 * @param {Object} originalSnippet - The original snippet we're comparing against
 * @returns {Promise<Array>} - Processed array of code snippets
 */
const processSearchResults = async (results, originalSnippet) => {
  // For a hackathon demo, we'll simulate the processing with mock data
  // In a real app, you would:
  // 1. Fetch the content of each page
  // 2. Extract code blocks using a parser
  // 3. Compare with original snippet
  
  return Promise.all(results.map(async (result, index) => {
    try {
      // Determine source type to generate more realistic mock code
      const source = extractDomainName(result.link);
      const sourceType = determineSourceType(source);
      
      // Generate realistic code snippet based on source and original snippet
      const mockCode = generateRealisticCodeSnippet(
        result.title, 
        result.snippet, 
        originalSnippet.language, 
        sourceType,
        originalSnippet.code
      );
      
      // Generate tags that would be relevant based on the search result snippet
      const extractedTags = extractTagsFromSearchResult(
        result.snippet,
        originalSnippet.language,
        originalSnippet.tags
      );
      
      // Calculate a more realistic similarity score
      const similarityScore = calculateSimilarityScore(
        mockCode,
        originalSnippet.code,
        index
      );
      
      return {
        _id: `web_${index}`,
        title: result.title,
        source: {
          url: result.link,
          name: source
        },
        language: originalSnippet.language,
        code: mockCode,
        description: result.snippet,
        tags: [...new Set([...extractedTags, ...originalSnippet.tags.slice(0, 2)])],
        similarityScore,
        fromWeb: true
      };
    } catch (err) {
      console.error(`Error processing search result ${index}:`, err);
      return null;
    }
  })).then(results => results.filter(Boolean)); // Remove any nulls
};

/**
 * Generate a more realistic code snippet based on the search result
 * @param {string} title - The title of the search result
 * @param {string} snippet - The snippet from the search result
 * @param {string} language - The programming language
 * @param {string} sourceType - The type of source (github, stackoverflow, etc.)
 * @param {string} originalCode - The original code to reference
 * @returns {string} - A generated code snippet
 */
const generateRealisticCodeSnippet = (title, snippet, language, sourceType, originalCode) => {
  // Extract possible function/variable names from title and snippet
  const nameMatches = (title + ' ' + snippet).match(/\b([A-Za-z][A-Za-z0-9_]*)\b/g) || [];
  const possibleNames = nameMatches
    .filter(name => name.length > 3)
    .filter(name => !['function', 'const', 'class', 'import', 'from', 'this', 'null', 'undefined'].includes(name))
    .slice(0, 3);
  
  // Get a name for our function/component/class
  const mainName = possibleNames[0] || 'example';
  const secondaryName = possibleNames[1] || 'helper';
  
  // Check if the original code has certain patterns
  const hasAsync = originalCode.includes('async') || originalCode.includes('await') || originalCode.includes('Promise');
  const hasReact = originalCode.includes('React') || originalCode.includes('useState') || originalCode.includes('Component');
  const hasLoop = originalCode.includes('for ') || originalCode.includes('while') || originalCode.includes('forEach') || originalCode.includes('map(');
  
  // Different templates based on language
  switch (language.toLowerCase()) {
    case 'javascript':
      if (hasReact) {
        return `// React component from ${sourceType}
import React, { useState${hasAsync ? ', useEffect' : ''} } from 'react';

function ${mainName.charAt(0).toUpperCase() + mainName.slice(1)}(props) {
  const [state, setState] = useState(${Math.random() > 0.5 ? '0' : 'null'});
  ${hasAsync ? `
  useEffect(() => {
    // Fetch data when component mounts
    const fetchData = async () => {
      try {
        const response = await fetch('/api/${mainName.toLowerCase()}');
        const data = await response.json();
        setState(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);` : ''}
  
  const handle${secondaryName.charAt(0).toUpperCase() + secondaryName.slice(1)} = () => {
    setState(prevState => !prevState);
  };

  return (
    <div className="${mainName}-container">
      <h2>{props.title || '${mainName.charAt(0).toUpperCase() + mainName.slice(1)}'}</h2>
      <button onClick={handle${secondaryName.charAt(0).toUpperCase() + secondaryName.slice(1)}}>
        Toggle State
      </button>
      {state && <p>State is active</p>}
    </div>
  );
}

export default ${mainName.charAt(0).toUpperCase() + mainName.slice(1)};`;
      } else if (hasAsync) {
        return `// Async function from ${sourceType}
/**
 * ${title.replace(/[^\w\s]/gi, '')}
 * @param {string} id - The identifier to process
 * @returns {Promise<Object>} The processed data
 */
async function ${mainName}(id) {
  try {
    const response = await fetch(\`/api/${mainName.toLowerCase()}/\${id}\`);
    
    if (!response.ok) {
      throw new Error(\`Error: \${response.status}\`);
    }
    
    const data = await response.json();
    return ${hasLoop ? `data.map(item => {
      return {
        ...item,
        processed: true,
        timestamp: new Date().toISOString()
      };
    })` : `{
      ...data,
      processed: true,
      timestamp: new Date().toISOString()
    }`};
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}`;
      } else {
        return `// Function from ${sourceType}
/**
 * ${title.replace(/[^\w\s]/gi, '')}
 * @param {Array} data - The input data to process
 * @returns {Array} The processed data
 */
function ${mainName}(data) {
  if (!Array.isArray(data)) {
    throw new TypeError('Input must be an array');
  }
  
  ${hasLoop ? `return data.filter(item => item !== null)
    .map(item => {
      // Process each item
      return {
        ...item,
        processed: true,
        timestamp: new Date().toISOString()
      };
    })` : `const result = {
    original: data,
    processed: true,
    count: data.length,
    timestamp: new Date().toISOString()
  };
  
  return result;`}
}`;
      }
      
    case 'python':
      if (hasAsync) {
        return `# Async function from ${sourceType}
import asyncio
import aiohttp

async def ${mainName}(${secondaryName}_id):
    """
    ${title.replace(/[^\w\s]/gi, '')}
    
    Args:
        ${secondaryName}_id: The ID to process
        
    Returns:
        dict: The processed data
    """
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"https://api.example.com/{${secondaryName}_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    ${hasLoop ? 
                    `# Process the results
                    results = []
                    for item in data:
                        if item is not None:
                            item["processed"] = True
                            results.append(item)
                    return results` : 
                    `# Process the data
                    data["processed"] = True
                    data["timestamp"] = datetime.now().isoformat()
                    return data`}
                else:
                    raise Exception(f"API returned status code {response.status}")
        except Exception as e:
            print(f"Error processing request: {e}")
            return None`;
      } else if (hasLoop) {
        return `# Function from ${sourceType}
def ${mainName}(data_list):
    """
    ${title.replace(/[^\w\s]/gi, '')}
    
    Args:
        data_list: List of items to process
        
    Returns:
        list: Processed items
    """
    if not isinstance(data_list, list):
        raise TypeError("Input must be a list")
    
    results = []
    for item in data_list:
        # Skip None values
        if item is None:
            continue
            
        # Process each item
        processed_item = {
            "original": item,
            "processed": True,
            "hash": hash(str(item))
        }
        results.append(processed_item)
        
    return results`;
      } else {
        return `# Function from ${sourceType}
def ${mainName}(${secondaryName}):
    """
    ${title.replace(/[^\w\s]/gi, '')}
    
    Args:
        ${secondaryName}: The input to process
        
    Returns:
        dict: The processed output
    """
    try:
        # Input validation
        if not ${secondaryName}:
            return None
            
        # Process the input
        result = {
            "input": ${secondaryName},
            "processed": True,
            "type": type(${secondaryName}).__name__,
            "length": len(${secondaryName}) if hasattr(${secondaryName}, "__len__") else 0
        }
        
        return result
    except Exception as e:
        print(f"Error in ${mainName}: {e}")
        return None`;
      }
    
    case 'html':
      return `<!-- HTML structure from ${sourceType} -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title.replace(/[^\w\s]/gi, '')}</title>
  <style>
    .${mainName.toLowerCase()}-container {
      padding: 20px;
      margin: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .${secondaryName.toLowerCase()}-item {
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="${mainName.toLowerCase()}-container">
    <h2>${title.replace(/[^\w\s]/gi, '')}</h2>
    <div class="${secondaryName.toLowerCase()}-item">
      <p>This is an example from ${sourceType}</p>
      <button id="${mainName.toLowerCase()}-btn">Click Me</button>
    </div>
  </div>
  
  <script>
    document.getElementById('${mainName.toLowerCase()}-btn').addEventListener('click', function() {
      alert('Button clicked!');
    });
  </script>
</body>
</html>`;
    
    case 'css':
      return `/* CSS styles from ${sourceType} */
.${mainName.toLowerCase()}-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  margin: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.${mainName.toLowerCase()}-header {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.${secondaryName.toLowerCase()}-item {
  padding: 10px;
  margin-bottom: 10px;
  background-color: white;
  border-left: 3px solid #2962ff;
}

@media (max-width: 768px) {
  .${mainName.toLowerCase()}-container {
    padding: 10px;
    margin: 10px;
  }
  
  .${mainName.toLowerCase()}-header {
    font-size: 20px;
  }
}`;
      
    default:
      // Generic code template for other languages
      return `// Code from ${sourceType} for ${language}
// Related to: ${title}

/**
 * ${mainName} function implementation
 * This is a sample code snippet that would be extracted from the web page
 * In a production environment, this would be actual code parsed from the page
 */
function ${mainName}() {
  // Implementation would be extracted from the web page
  console.log("This is a sample implementation");
  
  // Example relevant to search query
  const ${secondaryName} = {
    id: 123,
    name: "Example",
    process: function() {
      // Processing logic would be here
      return true;
    }
  };
  
  return ${secondaryName};
}`;
  }
};

/**
 * Determine the source type based on the domain name
 * @param {string} domain - The domain name
 * @returns {string} - The type of source
 */
const determineSourceType = (domain) => {
  domain = domain.toLowerCase();
  
  if (domain.includes('github')) {
    return 'GitHub';
  } else if (domain.includes('stackoverflow')) {
    return 'Stack Overflow';
  } else if (domain.includes('mdn') || domain.includes('mozilla')) {
    return 'MDN Web Docs';
  } else if (domain.includes('codepen')) {
    return 'CodePen';
  } else if (domain.includes('jsfiddle')) {
    return 'JSFiddle';
  } else if (domain.includes('w3schools')) {
    return 'W3Schools';
  } else if (domain.includes('dev.to')) {
    return 'Dev.to';
  } else if (domain.includes('medium')) {
    return 'Medium';
  } else {
    return domain;
  }
};

/**
 * Extract relevant tags from search result
 * @param {string} snippet - The search result snippet
 * @param {string} language - The programming language
 * @param {Array} originalTags - The original snippet tags
 * @returns {Array} - Array of extracted tags
 */
const extractTagsFromSearchResult = (snippet, language, originalTags) => {
  // Common programming concepts to look for in results
  const conceptKeywords = {
    javascript: ['array', 'object', 'function', 'promise', 'async', 'component', 'hook', 'react', 'vue', 'angular', 'node', 'express', 'api', 'dom'],
    python: ['list', 'dict', 'function', 'class', 'async', 'django', 'flask', 'pandas', 'numpy', 'api'],
    html: ['element', 'form', 'input', 'semantic', 'layout', 'responsive'],
    css: ['flexbox', 'grid', 'animation', 'responsive', 'media-query', 'selector', 'variable'],
    java: ['class', 'method', 'interface', 'spring', 'maven', 'hibernate', 'awt', 'swing'],
    csharp: ['class', 'method', 'linq', 'entity', 'asp', 'dotnet', 'xamarin', 'wpf'],
  };
  
  // Get relevant keywords for this language
  const keywords = conceptKeywords[language.toLowerCase()] || conceptKeywords.javascript;
  
  // Find matches in the snippet
  const foundTags = keywords.filter(keyword => 
    snippet.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Add language-specific tag if not already included
  if (!foundTags.includes(language.toLowerCase())) {
    foundTags.unshift(language.toLowerCase());
  }
  
  // Add at least one tag from original snippet if we found few tags
  if (foundTags.length < 2 && originalTags.length > 0) {
    foundTags.push(originalTags[0]);
  }
  
  return foundTags.slice(0, 4); // Limit to 4 tags
};

/**
 * Calculate a similarity score between the original and found code
 * @param {string} mockCode - The generated code
 * @param {string} originalCode - The original code
 * @param {number} index - The index of the result (earlier results likely more relevant)
 * @returns {number} - A similarity score
 */
const calculateSimilarityScore = (mockCode, originalCode, index) => {
  // Base score starts high for first results and decreases for later ones
  let baseScore = 85 - (index * 5);
  
  // Adjust score based on length similarity
  const lengthDiff = Math.abs(mockCode.length - originalCode.length);
  let lengthPenalty = 0;
  
  if (lengthDiff > originalCode.length) {
    lengthPenalty = 15;
  } else if (lengthDiff > originalCode.length / 2) {
    lengthPenalty = 10;
  } else if (lengthDiff > originalCode.length / 4) {
    lengthPenalty = 5;
  }
  
  // Check for common keywords/tokens
  const originalTokens = originalCode.split(/\W+/).filter(t => t.length > 2);
  const mockTokens = mockCode.split(/\W+/).filter(t => t.length > 2);
  
  const commonTokenCount = mockTokens.filter(token => 
    originalTokens.includes(token)
  ).length;
  
  const tokenBonus = Math.min(10, commonTokenCount);
  
  // Calculate final score
  const score = Math.max(30, Math.min(95, baseScore - lengthPenalty + tokenBonus));
  
  return Math.round(score);
};

/**
 * Extract relevant keywords from a code snippet
 * @param {string} code - The code to extract keywords from
 * @param {number} maxKeywords - Maximum number of keywords to extract
 * @returns {Array} - Array of extracted keywords
 */
const extractKeywords = (code, maxKeywords = 3) => {
  // In production, you would use more sophisticated NLP or code analysis
  // For the hackathon, we'll use a simplified approach
  
  // Remove common syntax symbols
  const cleanedCode = code.replace(/[{}\[\]();.,=<>!&|+\-*/%^~#]/g, ' ');
  
  // Split into words, filter out short words and common keywords
  const commonKeywords = new Set([
    'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while',
    'class', 'this', 'new', 'import', 'export', 'from', 'try', 'catch', 'async', 'await'
  ]);
  
  const words = cleanedCode.split(/\s+/)
    .filter(word => word.length > 3) // Filter out short words
    .filter(word => !commonKeywords.has(word.toLowerCase())) // Filter out common keywords
    .filter(word => /^[a-zA-Z0-9_$]+$/.test(word)); // Only keep valid identifier-like words
  
  // Get the most frequent words
  const wordFrequency = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, maxKeywords) // Take the top N
    .map(([word]) => word); // Extract just the words
};

/**
 * Extract domain name from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} - Domain name
 */
const extractDomainName = (url) => {
  try {
    const hostname = new URL(url).hostname;
    // Extract the domain name (e.g., stackoverflow.com from www.stackoverflow.com)
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2) {
      // Handle cases like www.example.com -> example.com
      if (domainParts[0] === 'www') {
        return `${domainParts[1]}.${domainParts[2]}`;
      }
      // Handle cases like example.com
      return hostname;
    }
    return hostname;
  } catch (e) {
    return url;
  }
};

module.exports = {
  findSimilarSnippetsOnline
};
