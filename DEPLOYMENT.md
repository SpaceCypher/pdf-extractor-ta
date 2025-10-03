# Add this to your project! Run this command to deploy to Vercel

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fpdf-extraction-playground&env=NEXT_PUBLIC_API_URL,NEXTAUTH_SECRET,NEXTAUTH_URL&envDescription=Environment%20variables%20needed%20for%20the%20application&envLink=https%3A%2F%2Fgithub.com%2Fyour-username%2Fpdf-extraction-playground%23environment-variables)

## Environment Variables for Vercel

When deploying to Vercel, you'll need to set these environment variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://spacecypher--pdf-extraction-simple-fastapi-app.modal.run

# Authentication (generate a secure secret)
NEXTAUTH_SECRET=your-super-secure-secret-key-here
NEXTAUTH_URL=https://your-vercel-app.vercel.app

# Database (optional - for user authentication)
DATABASE_URL=your-database-connection-string

# OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Deployment Steps

1. **Fork the Repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository

3. **Set Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Add the environment variables listed above
   - Generate a secure `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

4. **Deploy**:
   - Vercel will automatically build and deploy
   - Your app will be live at `https://your-project.vercel.app`

## Post-Deployment Setup

### Database Setup (Optional)
If you want user authentication, set up a database:

**Option 1: Supabase (Free)**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Add to `DATABASE_URL` in Vercel environment variables

**Option 2: PlanetScale (Free)**
1. Create account at [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string
4. Add to `DATABASE_URL` in Vercel environment variables

### OAuth Setup (Optional)
For GitHub OAuth:
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create New OAuth App
3. Set Homepage URL to your Vercel app URL
4. Set Authorization callback URL to `https://your-app.vercel.app/api/auth/callback/github`
5. Add Client ID and Secret to Vercel environment variables

## Testing Your Deployment

1. Visit your deployed app
2. Test PDF upload and extraction
3. Try different AI models (Docling, Surya, MinerU)
4. Check authentication if enabled
5. Test on mobile devices

## Performance Optimization

Your deployed app will automatically benefit from:
- ✅ Edge caching via Vercel CDN
- ✅ Automatic image optimization
- ✅ Serverless functions for API routes
- ✅ Gzip compression
- ✅ HTTP/2 support

## Domain Setup (Optional)

To use a custom domain:
1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your custom domain
4. Update `NEXTAUTH_URL` to match your domain

## Monitoring

Monitor your deployed app:
- **Vercel Analytics**: Built-in performance monitoring
- **Vercel Logs**: View function execution logs
- **Error Tracking**: Set up Sentry for error monitoring

Your PDF Extraction Playground is now live and ready for users! 🚀