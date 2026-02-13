# 🚀 Deployment Guide

Complete guide to deploy **Mirfa Secure App** with Neon DB to production (Vercel, Netlify, or self-hosted).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Neon Database](#setup-neon-database)
- [Vercel Deployment](#vercel-deployment)
- [Netlify Deployment](#netlify-deployment)
- [Self-Hosted Deployment](#self-hosted-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with repository pushed
- ✅ Neon DB account (https://console.neon.tech)
- ✅ Node.js 18+ installed locally
- ✅ Master encryption key (32-byte hex - 64 characters)
- ✅ Git configured with your credentials

### Generate Master Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this securely - it's required for encryption/decryption!

---

## Setup Neon Database

### 1. Create Neon Account & Database

```
1. Go to: https://console.neon.tech
2. Sign up with GitHub
3. Create new project
4. Create database (keep default settings)
5. Copy connection string from Project Details
```

### 2. Connection String Format

```
postgresql://username:password@ep-projectname.region.neon.tech/database?sslmode=require&channel_binding=require
```

### 3. Create Tables

```bash
cd packages/db
npx prisma db push
```

---

## Vercel Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Deploy to Vercel - Neon DB integration"
git push origin main
```

### Step 2: Deploy Web App (Next.js)

1. Visit **https://vercel.com**
2. Click **"Add New"** → **"Project"**
3. Select your **mirfa-secure-app** repository
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `./apps/web`
   - **Environment Variables**:
     ```
     NEXT_PUBLIC_API_URL=https://your-api.vercel.app
     ```
5. Click **Deploy**

**Your web app is now live!** 🎉

### Step 3: Deploy API (Fastify)

1. Go to Vercel Dashboard
2. Click **"Add New"** → **"Project"**
3. Select same repository
4. Configure:
   - **Root Directory**: `./apps/api`
   - **Environment Variables**:
     ```
     MASTER_KEY=your_64_character_hex_key
     DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/database?sslmode=require&channel_binding=require
     NODE_ENV=production
     ```
5. Click **Deploy**

**Your API is deployed!** 🎉

### Step 4: Update Web App URL

After API deployment, you'll get a URL like `https://api-xxx.vercel.app`

1. Go to **Web Project** → **Settings** → **Environment**
2. Update `NEXT_PUBLIC_API_URL` to your new API URL
3. **Redeploy** web app

---

## Netlify Deployment

### Web App Deployment

1. Go to **https://app.netlify.com**
2. Click **"Add new site"** → **"Import an existing project"**
3. Select GitHub repository
4. Configure:
   - **Base directory**: `apps/web`
   - **Build command**: `pnpm run build`
   - **Publish directory**: `.next`
   - **Environment Variables**:
     ```
     NEXT_PUBLIC_API_URL=https://your-api-url.com
     ```
5. Click **Deploy**

### API Deployment

For API, use **Vercel** (recommended) as Netlify doesn't support Fastify serverless functions well.

Or use **Railway.app**, **Heroku**, or **DigitalOcean App Platform**:

#### Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init

# Deploy
railway deploy
```

Set environment variables in Railway dashboard:
- `MASTER_KEY`
- `DATABASE_URL`
- `NODE_ENV=production`

---

## Self-Hosted Deployment

### Using Docker

```dockerfile
# Create Dockerfile in apps/api
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start API
cd apps/api
pnpm install
pm2 start "pnpm run dev" --name "mirfa-api"

# Save configuration
pm2 save
pm2 startup
```

### Environment Variables

Create `.env` in `apps/api`:

```env
MASTER_KEY=your_64_character_hex_key
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/database?sslmode=require&channel_binding=require
NODE_ENV=production
PORT=3001
```

---

## Environment Variables

### Web App (apps/web)

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### API (apps/api)

```env
# Encryption
MASTER_KEY=aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899

# Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require&channel_binding=require

# Environment
NODE_ENV=production
PORT=3001
```

### Database (packages/db)

```env
# Same DATABASE_URL as API
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## Deployment Checklist

- ✅ Neon DB set up and tables created
- ✅ Master key generated and saved securely
- ✅ Git repository pushed to GitHub
- ✅ Environment variables configured
- ✅ Web app deployed
- ✅ API deployed
- ✅ API URL updated in web app
- ✅ Database connection tested
- ✅ Encryption/Decryption endpoints tested

---

## Testing After Deployment

### 1. Test Encryption Endpoint

```bash
curl -X POST https://your-api.com/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "partyId": "test-party",
    "payload": {"message": "Hello from production"}
  }'
```

### 2. Test Fetch Endpoint

```bash
# Replace {id} with transaction ID from encryption
curl https://your-api.com/tx/{id}
```

### 3. Test Decryption Endpoint

```bash
curl -X POST https://your-api.com/tx/{id}/decrypt \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 4. Test Records List

```bash
curl https://your-api.com/records
```

---

## Troubleshooting

### "Database connection failed"

- ✅ Check `DATABASE_URL` is correct
- ✅ Verify Neon DB connection string from console
- ✅ Ensure SSL mode is set to `require`

### "Prisma client not initialized"

```bash
cd packages/db
npx prisma generate
```

### "MASTER_KEY format invalid"

- ✅ Must be exactly 64 hexadecimal characters
- ✅ Regenerate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### "Decryption failed"

- ✅ Ensure `MASTER_KEY` matches between API instances
- ✅ Check transaction exists in database
- ✅ Verify correct transaction ID

### "API not responding from web app"

- ✅ Check `NEXT_PUBLIC_API_URL` is correct
- ✅ Verify API is deployed and running
- ✅ Check CORS is enabled (enabled by default)

---

## Security Best Practices

1. **Never commit** `.env` files or secrets to Git
2. **Rotate `MASTER_KEY`** periodically (will require re-encryption)
3. **Use HTTPS only** for all connections
4. **Enable Neon DB IP restriction** (Settings → Security)
5. **Monitor API logs** for suspicious activity
6. **Backup database regularly** (Neon provides automatic backups)

---

## Support

For issues:
1. Check logs in deployment platform dashboard
2. Verify environment variables are set
3. Test API locally: `cd apps/api && pnpm run dev`
4. Check database connection: `cd packages/db && npx prisma db execute --stdin < query.sql`

---

✅ **Deployment Complete!** Your secure encryption API is live.
