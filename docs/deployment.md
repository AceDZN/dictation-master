# Dictation Manager Deployment Guide

This guide provides detailed instructions for deploying the Dictation Manager application to various platforms.

## Table of Contents

- [Deployment Prerequisites](#deployment-prerequisites)
- [Deploying to Vercel](#deploying-to-vercel)
- [Deploying to Firebase Hosting](#deploying-to-firebase-hosting)
- [Deploying to a Custom Server](#deploying-to-a-custom-server)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment Verification](#post-deployment-verification)
- [Continuous Integration/Continuous Deployment](#continuous-integrationcontinuous-deployment)

## Deployment Prerequisites

Before deploying the Dictation Manager application, ensure you have:

1. A complete and tested build of the application
2. A Firebase project set up with:
   - Firestore database
   - Firebase Authentication
   - Firebase Storage (optional, for file uploads)
3. Required environment variables documented and ready
4. Domain name (optional, but recommended for production)

## Deploying to Vercel

Vercel is the recommended deployment platform for Next.js applications like Dictation Manager.

### Steps for Vercel Deployment

1. **Prepare Your Repository**:
   - Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket)
   - Make sure the repository contains a working `package.json` file with build scripts

2. **Connect with Vercel**:
   - Create an account on [Vercel](https://vercel.com) if you don't have one
   - Click "Import Project" from the Vercel dashboard
   - Select your Git provider and authorize Vercel to access your repositories
   - Select the Dictation Manager repository

3. **Configure Project Settings**:
   - Set the Framework Preset to "Next.js"
   - Configure the build settings:
     - Build Command: `next build`
     - Output Directory: `.next`
   - Add environment variables (see [Environment Configuration](#environment-configuration))

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Once completed, your application will be available at a Vercel-provided URL

5. **Custom Domain** (Optional):
   - Go to "Settings" > "Domains"
   - Add your custom domain
   - Follow the instructions to configure DNS settings

### Automatic Deployments

With Vercel, any commits pushed to your main branch will automatically trigger a new deployment.

## Deploying to Firebase Hosting

Firebase Hosting is another excellent option, especially since the application already uses Firebase services.

### Steps for Firebase Hosting Deployment

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   ```
   
   During initialization:
   - Select your Firebase project
   - Set the public directory to "out"
   - Configure as a single-page app
   - Set up automatic builds and deploys (optional)

4. **Update Next.js Config**:
   Add the following to your `next.config.js` file:
   ```javascript
   module.exports = {
     output: 'export',
     images: {
       unoptimized: true,
     },
     // ... other config options
   }
   ```

5. **Build the Application**:
   ```bash
   npm run build
   ```

6. **Deploy to Firebase**:
   ```bash
   firebase deploy --only hosting
   ```

7. **Custom Domain** (Optional):
   - Go to the Firebase console > Hosting
   - Connect your custom domain and verify ownership
   - Set up DNS records as instructed

## Deploying to a Custom Server

For more control, you can deploy the Dictation Manager to your own server.

### Steps for Custom Server Deployment

1. **Prepare Your Server**:
   - Set up a server with Node.js (version 18 or higher)
   - Install a process manager like PM2:
     ```bash
     npm install -g pm2
     ```
   - Set up Nginx or Apache as a reverse proxy (recommended)

2. **Deploy Your Code**:
   - Clone your repository to the server:
     ```bash
     git clone https://github.com/yourusername/dictation-manager.git
     cd dictation-manager
     ```
   - Install dependencies:
     ```bash
     npm install --production
     ```
   - Build the application:
     ```bash
     npm run build
     ```

3. **Set Up Environment Variables**:
   - Create a `.env` file with the required variables

4. **Start the Application with PM2**:
   ```bash
   pm2 start npm --name "dictation-manager" -- start
   ```

5. **Configure Nginx as a Reverse Proxy**:
   Create a configuration file in `/etc/nginx/sites-available/dictation-manager`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable the Site and Restart Nginx**:
   ```bash
   ln -s /etc/nginx/sites-available/dictation-manager /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

7. **Set Up SSL with Certbot** (recommended):
   ```bash
   certbot --nginx -d yourdomain.com
   ```

## Environment Configuration

The following environment variables are required for deployment:

### Firebase Configuration

```
# Firebase Client SDK (for browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

### Authentication Configuration

```
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_random_secret_key
```

### Additional Configuration

```
# OpenAI API Key (for content generation)
OPENAI_API_KEY=your_openai_api_key

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## Post-Deployment Verification

After deploying the application, verify that:

1. **The application loads correctly**:
   - Homepage opens without errors
   - Navigation works as expected

2. **Authentication works**:
   - Users can sign up
   - Users can log in
   - Protected routes are accessible only to authenticated users

3. **Core functionality works**:
   - Creating a dictation game
   - Playing a dictation game
   - Editing a dictation game

4. **API endpoints work**:
   - Test the `/api/dictation/play/{id}` endpoint
   - Test the `/api/dictation/create` endpoint

## Continuous Integration/Continuous Deployment

### GitHub Actions

You can set up CI/CD with GitHub Actions by creating a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          # Add your environment variables here
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # ... other env vars

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Vercel Integration

Vercel also offers direct integration with GitHub, GitLab, and Bitbucket, which automatically sets up CI/CD:

1. Connect your repository to Vercel
2. Configure the build settings
3. Vercel will automatically deploy on each push to the main branch

## Monitoring and Logging

For production deployments, set up:

1. **Error Tracking**:
   - Consider integrating Sentry or LogRocket

2. **Performance Monitoring**:
   - Use Vercel Analytics or Google Analytics

3. **Server Logs**:
   - Configure server logs to be stored and easily accessible

## Scaling Considerations

As your user base grows:

1. **Firebase Pricing Tiers**:
   - Monitor your Firebase usage and upgrade plans as needed

2. **Caching Strategy**:
   - Implement caching for frequently accessed data

3. **CDN Integration**:
   - Use a CDN for static assets to improve global performance 