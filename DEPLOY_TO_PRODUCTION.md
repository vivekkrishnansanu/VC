# Deploy to Production - Quick Guide

## 🚀 Deploy to Vercel (Recommended)

Your project is already configured for Vercel deployment. Follow these steps:

### Step 1: Push to GitHub

Make sure all your changes are committed and pushed to the repository:

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Deploy via Vercel Dashboard

1. **Go to [Vercel](https://vercel.com)**
   - Sign in with your GitHub account
   - Click "Add New Project"

2. **Import Your Repository**
   - Select the `vivekkrishnansanu/VC` repository
   - Vercel will auto-detect Next.js settings

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm ci` (recommended for production)

4. **Environment Variables** (Optional for demo)
   
   For demo mode with mock data, you can skip environment variables.
   
   For production with database:
   ```bash
   DATABASE_URL=mysql://user:password@host:port/database
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://vc-onboarding.vercel.app` (or custom domain)

### Step 3: Verify Deployment

1. Visit your deployment URL
2. Test the application:
   - Login flow
   - Dashboard navigation
   - Onboarding wizard
   - All major features

## 🔧 Alternative: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

## 📋 Pre-Deployment Checklist

- [x] Code is committed and pushed to GitHub
- [ ] Build passes locally (`npm run build`)
- [ ] All environment variables documented
- [ ] Security headers configured (already in `next.config.ts`)
- [ ] Error tracking configured (optional)
- [ ] Database setup (if using production database)

## 🐛 Troubleshooting

### Build Fails

If build fails on Vercel:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (Vercel uses 18.x by default)
4. Check for TypeScript errors: `npm run type-check`

### Environment Variables

- Set in Vercel Dashboard → Project → Settings → Environment Variables
- Add for Production, Preview, and Development environments as needed

### Database Connection

- For demo: No database needed (uses mock data)
- For production: Set `DATABASE_URL` in Vercel environment variables

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- See `DEPLOYMENT.md` for detailed deployment guide

## 🎉 After Deployment

Your app will be available at:
- **Production URL**: `https://vc-onboarding.vercel.app`
- **Custom Domain**: Configure in Vercel project settings

---

**Note**: The current setup uses mock data, so no database is required for initial deployment. You can add database support later when ready.
