# Frontend Application

This README provides instructions on how to run the frontend application outside of Docker and how to handle CORS issues that may arise during development.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

To install the dependencies, run the following command in the frontend directory:

```bash
npm install
```

## Configuration

The application uses environment variables for configuration. These are stored in the `.env` file in the frontend directory. The default configuration includes:

```
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_PORTFOLIO_SERVICE_URL=http://localhost:8001
```

Make sure these services are running and accessible at the specified URLs.

## Running the Application

To start the development server, run:

```bash
npm start
```

This will start the application in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes. You may also see any lint errors in the console.

## Building for Production

To build the application for production, run:

```bash
npm run build
```

This builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

## Handling CORS Issues

When running the frontend outside of Docker, you may encounter Cross-Origin Resource Sharing (CORS) issues when trying to connect to the backend services. Here are some ways to handle these issues:

### Option 1: Configure the Backend to Allow CORS

Ensure that your backend services are configured to allow CORS requests from your frontend's origin (e.g., http://localhost:3000).

### Option 2: Use a Proxy

The application is configured with a proxy in `package.json`:

```json
"proxy": "http://localhost:5000"
```

This will proxy API requests from the React app to the specified URL, avoiding CORS issues for requests to that server.

### Option 3: Disable CORS in Chrome for Development

For development purposes only, you can launch Chrome with web security disabled:

```bash
# macOS
open -na "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/temporary-chrome-profile"

# Windows
start chrome --disable-web-security --user-data-dir="C:/ChromeDevSession"

# Linux
google-chrome --disable-web-security --user-data-dir="/tmp/chrome-dev-session"
```

**Warning**: This approach should only be used for development and testing. It disables security features in your browser and should never be used for general browsing or in a production environment.

## Troubleshooting

If you encounter issues:

1. Ensure all backend services are running and accessible
2. Check the browser console for error messages
3. Verify that the URLs in the `.env` file are correct
4. Try clearing your browser cache or using an incognito window