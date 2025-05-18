# SnipAI - Smart Code Snippet Manager

SnipAI is a smart code snippet manager built for the HackMern.AI hackathon. It allows developers to store, organize, and retrieve code snippets with AI-powered tagging and explanations.

## Features

- 📋 Store and manage code snippets with syntax highlighting
- 🏷️ Auto-generate tags using AI to categorize snippets
- 📝 Generate explanations of what the code does
- 🔍 Easy retrieval of code snippets
- 💻 Clean, modern UI for a great user experience

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **State Management**: React Hooks
- **Styling**: Custom CSS
- **Syntax Highlighting**: highlight.js
- **Mock Database**: In-memory JavaScript object (for hackathon demo)

## Quick Start

### Prerequisites

- Node.js and npm installed

### Installation

1. Clone this repository
2. Install backend dependencies:
   ```
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd client
   npm install
   ```

### Running the Application

From the root directory, run:

```
npm run dev
```

This command will start both the backend server (port 5000) and the React frontend (port 3000) concurrently.

## Project Structure

```
SnipAI/
├── .env                   # Environment variables
├── package.json          # Backend dependencies and scripts
├── backend/              # Backend code
│   ├── server.js         # Express server setup
│   ├── config/           # Configuration files
│   ├── models/           # Data models
│   └── routes/           # API routes
└── client/               # Frontend React app
    ├── public/           # Static files
    └── src/              # React source code
        ├── components/   # UI components
        └── pages/        # Page components
```

## Future Enhancements

- Add user authentication
- Implement real AI tagging using OpenAI
- Add search functionality
- Add snippet categorization
- Real-time collaboration features

## Hackathon Notes

This project was built for the HackMern.AI hackathon in a limited time. For the purpose of the demo, we're using a mock in-memory database instead of MongoDB to simplify the setup and focus on functionality.
