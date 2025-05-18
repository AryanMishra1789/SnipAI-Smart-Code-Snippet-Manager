# Railway Deployment Guide for SnipAI

This guide provides step-by-step instructions for deploying the SnipAI application on Railway.

## Prerequisites

1. A GitHub account with your SnipAI repository
2. A Railway account (sign up at https://railway.app if you don't have one)

## Deployment Steps

### 1. Push Your Code to GitHub

Make sure your latest code changes are pushed to your GitHub repository.

### 2. Connect Railway to GitHub

1. Log in to your Railway account
2. Click on "New Project"
3. Select "Deploy from GitHub repo"
4. Find and select your SnipAI repository
5. Choose the branch you want to deploy (usually `main` or `master`)

### 3. Configure Environment Variables

In your Railway project settings, add the following environment variables:

- `NODE_ENV=production`
- `PORT=5000` (Railway will override this with its own port)
- Add any other required API keys:
  - `MONGO_URI` (if you're using a real MongoDB instance)
  - `GOOGLE_API_KEY` (if you're using Google APIs)
  - `SEARCH_ENGINE_ID` (if you're using Google Custom Search)
  - `GEMINI_API_KEY` (if you're using Google Gemini API)

### 4. Deploy

1. Railway should automatically start the deployment process
2. You can monitor the build logs in the Railway console
3. Once deployment is complete, Railway will provide you with a URL to access your application

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs in Railway for specific error messages
2. Common issues include:
   - Missing environment variables
   - Build process failures
   - Dependency installation problems

### Build Process

The build process in our app does the following:

1. Installs backend dependencies
2. Installs frontend dependencies
3. Builds the React frontend application
4. Serves both the API and static files from a single Node.js server

### File Structure After Build

```
SnipAI/
├── package.json        # Main package.json with scripts
├── Procfile            # Instructions for Railway
├── backend/            # Backend code
│   ├── server.js       # Express server that serves API and static files
│   └── ...
├── client/            
│   ├── build/          # Built React app (static files)
│   │   ├── index.html  # Entry point HTML
│   │   ├── static/     # Static assets
│   │   └── ...
│   └── ...
└── ...
```

## Updating Your Deployment

To update your deployed application:

1. Make changes to your code
2. Push changes to your GitHub repository
3. Railway will automatically detect the changes and redeploy your application
