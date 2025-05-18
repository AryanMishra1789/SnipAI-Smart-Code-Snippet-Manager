# SnipAI Backend API Deployment

This guide provides instructions for deploying the backend API separately from the frontend.

## Options for Backend Deployment

### 1. Render.com (Recommended)

1. **Sign up/Log in to Render**:
   - Create an account at [render.com](https://render.com)

2. **Create a new Web Service**:
   - Click "New +" > "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - Name: `snipai-backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `node backend/server.js`
   - Click "Create Web Service"

3. **Environment Variables**:
   - Add `NODE_ENV=production`
   - Add any other required API keys

### 2. Heroku

1. **Sign up/Log in to Heroku**:
   - Create an account at [heroku.com](https://heroku.com)

2. **Create a new app**:
   - Click "New" > "Create new app"
   - Choose a unique name for your app

3. **Deploy via GitHub**:
   - Connect your GitHub repository
   - Enable automatic deploys (optional)
   - Click "Deploy Branch"

4. **Environment Variables**:
   - Go to Settings > Config Vars
   - Add `NODE_ENV=production`
   - Add any other required API keys

### 3. Digital Ocean App Platform

1. **Sign up/Log in to Digital Ocean**:
   - Create an account at [digitalocean.com](https://digitalocean.com)

2. **Create a new app**:
   - Go to the App Platform section
   - Click "Create App" > "GitHub"
   - Select your repository
   - Configure build settings:
     - Build Command: `npm install`
     - Run Command: `node backend/server.js`
   - Click "Launch App"

## Connecting Frontend to Deployed Backend

1. **Update environment variables in your frontend deployment**:
   - Set `REACT_APP_BACKEND_URL` to your backend URL (e.g., `https://snipai-backend.onrender.com`)

2. **Update CORS settings in backend/server.js**:
   - Add your frontend domain to the allowed origins list

3. **Rebuild and redeploy your frontend**:
   - The frontend will now connect to your deployed backend API

## Testing the Deployment

After deploying:

1. Test the backend API directly using a tool like Postman
2. Try accessing an endpoint like `/api/snippets`
3. Ensure your frontend can successfully communicate with the backend API
