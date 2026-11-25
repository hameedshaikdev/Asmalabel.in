# Deployment Guide

## Deploying to Vercel

### Step 1: Prepare Your Code

1. **Create a GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Verify build locally:**
   ```bash
   npm run build
   npm run preview
   ```

### Step 2: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com) and sign up/login**

2. **Import your project:**
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure project:**
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variables:**
   Click on "Environment Variables" and add:
   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   VITE_RAZORPAY_KEY_ID = your_razorpay_key_id
   ```

5. **Deploy:**
   Click "Deploy" and wait for the build to complete

### Step 3: Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Alternative: Deploy to Netlify

### Step 1: Build Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Deploy

1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect to your GitHub repository
4. Add environment variables in site settings
5. Deploy

## Post-Deployment Checklist

- [ ] Test all features on production URL
- [ ] Verify environment variables are set correctly
- [ ] Test authentication flow
- [ ] Test payment integration (with test mode)
- [ ] Check image uploads work correctly
- [ ] Test on different devices and browsers
- [ ] Set up custom domain (if applicable)
- [ ] Configure Supabase allowed URLs
- [ ] Configure Razorpay webhook URLs
- [ ] Set up monitoring and error tracking

## Updating Your Deployment

To update your live site:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel/Netlify will automatically rebuild and deploy.

## Environment-Specific Configurations

### Production
- Use production Razorpay keys
- Enable Supabase database backups
- Set up proper error logging
- Enable rate limiting

### Staging
- Use separate Supabase project
- Use test Razorpay keys
- Test new features before production

## Troubleshooting Deployment Issues

### Build Fails
- Check build logs in Vercel/Netlify dashboard
- Verify all dependencies are in package.json
- Test build locally first

### Environment Variables Not Working
- Make sure variable names start with `VITE_`
- Redeploy after adding new variables
- Check for typos in variable names

### 404 Errors on Routes
- Verify redirect rules are set correctly
- For Vercel, this is usually automatic
- For Netlify, check netlify.toml configuration

### Images Not Loading
- Check Supabase Storage CORS settings
- Verify bucket is public
- Check image URLs in production

## Performance Optimization

1. **Enable Vercel Analytics:**
   - Go to project settings → Analytics
   - Enable Web Analytics

2. **Optimize Images:**
   - Use WebP format when possible
   - Implement lazy loading
   - Use appropriate image sizes

3. **Enable Caching:**
   - Configure proper cache headers
   - Use Vercel's Edge Network

4. **Monitor Performance:**
   - Use Lighthouse reports
   - Monitor Core Web Vitals
   - Set up error tracking (e.g., Sentry)

## Security in Production

1. **Supabase:**
   - Review Row Level Security policies
   - Add production URL to allowed URLs
   - Enable email confirmations
   - Set up database backups

2. **Razorpay:**
   - Switch to live keys
   - Configure webhook URLs
   - Enable payment notifications
   - Set up refund policies

3. **General:**
   - Enable HTTPS (automatic with Vercel)
   - Set secure headers
   - Implement rate limiting
   - Regular security audits

## Monitoring and Maintenance

1. **Set up monitoring:**
   - Vercel Analytics
   - Supabase Dashboard
   - Error tracking (Sentry, LogRocket)

2. **Regular maintenance:**
   - Update dependencies monthly
   - Monitor database size
   - Check error logs weekly
   - Review user feedback

3. **Backup strategy:**
   - Enable Supabase automated backups
   - Export database regularly
   - Keep code in version control

## Support

For deployment issues:
- Check Vercel/Netlify documentation
- Review Supabase deployment guides
- Consult Razorpay integration docs
