# 🚀 MovieFlix Deployment Guide

## Environment Variable Priority

Environment variables are loaded in this order (later files override earlier ones):

1. **`.env`** - Base configuration (committed to repo)
2. **`.env.production`** - Production defaults (committed to repo)
3. **`.env.local`** - Local overrides (never committed)

## 🔧 Production Deployment

### Step 1: Prepare Your MongoDB URI

Your current MongoDB Atlas URI:
\`\`\`
mongodb+srv://hspa4132:Hsp@4132@cluster0.ixqhj.mongodb.net/movieflix?retryWrites=true&w=majority&appName=Cluster0
\`\`\`

**Important**: The `@` in your password will be automatically encoded to `%40` by the app.

### Step 2: Generate Production JWT Secret

\`\`\`bash
# Generate a secure JWT secret for production
npm run generate-jwt
\`\`\`

Copy the generated secret for use in production environment variables.

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
# Paste: mongodb+srv://hspa4132:Hsp@4132@cluster0.ixqhj.mongodb.net/movieflix?retryWrites=true&w=majority&appName=Cluster0

vercel env add JWT_SECRET
# Paste your generated JWT secret

vercel env add MONGODB_DB_NAME
# Enter: movieflix
\`\`\`

#### Option B: Using Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add these variables for **Production**:

   \`\`\`
   MONGODB_URI=mongodb+srv://hspa4132:Hsp@4132@cluster0.ixqhj.mongodb.net/movieflix?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-generated-jwt-secret-here
   MONGODB_DB_NAME=movieflix
   NODE_ENV=production
   \`\`\`

3. **Deploy**:
   - Vercel will automatically deploy when you push to main branch

### Step 4: Deploy to Netlify

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add the same variables as Vercel above

### Step 5: Deploy to Railway

\`\`\`bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set MONGODB_URI="mongodb+srv://hspa4132:Hsp@4132@cluster0.ixqhj.mongodb.net/movieflix?retryWrites=true&w=majority&appName=Cluster0"
railway variables set JWT_SECRET="your-generated-jwt-secret"
railway variables set MONGODB_DB_NAME="movieflix"
\`\`\`

## 🔍 Verify Deployment

After deployment, check these endpoints:

1. **Health Check**: `https://your-domain.com/api/health`
2. **Homepage**: `https://your-domain.com`
3. **Movies**: `https://your-domain.com/movies/[any-movie-id]`
4. **Search**: `https://your-domain.com/search?q=train`

## 🐛 Troubleshooting

### MongoDB Connection Issues

If you see connection errors:

1. **Check Environment Variables**:
   \`\`\`bash
   # Test locally first
   npm run check-connection
   \`\`\`

2. **Verify MongoDB Atlas**:
   - Ensure your cluster is running
   - Check IP whitelist (add 0.0.0.0/0 for all IPs)
   - Verify username/password

3. **Check Encoding**:
   - The app automatically handles `@` in passwords
   - Don't manually encode the URI

### Build Errors

If deployment fails:

1. **Test Build Locally**:
   \`\`\`bash
   npm run build
   npm run start
   \`\`\`

2. **Check Dependencies**:
   \`\`\`bash
   npm audit fix
   \`\`\`

3. **Verify Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names

## 📊 Production Environment Variables

Required for production:

\`\`\`env
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secure-jwt-secret
MONGODB_DB_NAME=movieflix

# Optional
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
\`\`\`

## 🔒 Security Notes

1. **Never commit `.env.local`** - contains sensitive data
2. **Use strong JWT secrets** - minimum 32 characters
3. **Rotate secrets regularly** - especially in production
4. **Monitor MongoDB access** - check for unusual activity
5. **Use HTTPS in production** - all hosting platforms provide this

## 🎬 Success!

Once deployed, your MovieFlix app will be live with:

- ✅ MongoDB Atlas database
- ✅ Secure authentication
- ✅ Movie browsing and search
- ✅ User comments
- ✅ Theater locations
- ✅ Responsive design

Your production app will automatically:
- Use MongoDB when available
- Fall back to dummy data if database fails
- Handle special characters in passwords
- Provide secure user sessions
