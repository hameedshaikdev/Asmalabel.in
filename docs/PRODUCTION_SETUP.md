# Production Environment Setup Guide

This guide will help you deploy your ShopHub e-commerce platform to production with all necessary configurations.

## 🌍 Environment Variables for Production

### Required Environment Variables

Create these environment variables in your production environment (Vercel, Netlify, etc.):

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Razorpay Payment Gateway (REQUIRED)
VITE_RAZORPAY_KEY_ID=rzp_live_your-live-key-id

# Optional: Analytics & Monitoring
VITE_GA_TRACKING_ID=your-google-analytics-id
VITE_HOTJAR_ID=your-hotjar-id
```

### Development vs Production Keys

| Service | Development | Production |
|---------|-------------|------------|
| **Supabase** | Test project keys | Production project keys |
| **Razorpay** | `rzp_test_` keys | `rzp_live_` keys |
| **WhatsApp** | Test numbers | Business verified numbers |

---

## 🚀 Deployment Steps

### 1. Prepare Your Code Repository

```bash
# Initialize git repository (if not done)
git init
git add .
git commit -m "Initial ShopHub e-commerce platform"

# Push to GitHub
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select your repository
5. Add environment variables (see section below)
6. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_RAZORPAY_KEY_ID

# Deploy to production
vercel --prod
```

### 3. Configure Environment Variables in Vercel

In your Vercel project settings → Environment Variables, add:

**Production Environment Variables:**
```
Name: VITE_SUPABASE_URL
Value: https://xqqrptlpuvkljebmszca.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: sb_publishable_MHsKz-fsSai4NX04ETbT-g_m4Gewlvc

Name: VITE_RAZORPAY_KEY_ID
Value: rzp_live_your-actual-live-key
```

---

## 🏦 Payment Gateway Setup (Razorpay)

### Development to Production Migration

1. **Log into Razorpay Dashboard**
   - Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
   
2. **Activate Live Mode**
   - Complete KYC verification
   - Add bank account details
   - Submit required documents

3. **Get Live API Keys**
   - Go to Settings → API Keys
   - Generate Live Keys
   - Replace test keys with live keys

4. **Configure Webhooks (Optional)**
   ```
   Webhook URL: https://your-domain.vercel.app/api/razorpay-webhook
   Events: payment.captured, payment.failed, order.paid
   ```

### Test Payment Flow
```bash
# Test cards for development
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date

# Live payments
Use real cards in production
```

---

## 🗄️ Database Configuration (Supabase)

### Production Database Setup

1. **Create Production Supabase Project**
   - New project for production
   - Different from development project
   - Enable daily backups

2. **Run Production SQL Scripts**
   ```sql
   -- Run these in your production Supabase SQL Editor:
   -- 1. database-setup.sql (tables and sample data)
   -- 2. storage-policies.sql (file upload permissions)
   ```

3. **Configure Authentication**
   - Enable Email authentication
   - Set up custom SMTP (optional)
   - Configure redirect URLs
   - Add your production domain

4. **Storage Bucket Setup**
   - Create `product-images` bucket
   - Set as public bucket
   - Configure CORS if needed

### Database Security Checklist
- ✅ Row Level Security (RLS) enabled
- ✅ API keys configured correctly
- ✅ Admin email updated to your email
- ✅ Test all CRUD operations
- ✅ Backup strategy in place

---

## 📱 WhatsApp Business Integration

### Current Setup
- **Admin Phone**: +919173963720 (your number)
- **Method**: Direct WhatsApp links
- **Trigger**: After successful payment

### For Production Enhancement

#### Option 1: WhatsApp Business API (Recommended)
1. **Get WhatsApp Business Account**
   - Apply at [business.whatsapp.com](https://business.whatsapp.com)
   - Verify business documents

2. **Use Third-Party Providers**
   - **Twilio**: [twilio.com/whatsapp](https://twilio.com/whatsapp)
   - **MessageBird**: [messagebird.com](https://messagebird.com)
   - **360Dialog**: [360dialog.com](https://360dialog.com)

3. **Integration Example (Twilio)**
   ```javascript
   // Add to environment variables
   VITE_TWILIO_ACCOUNT_SID=your-account-sid
   VITE_TWILIO_AUTH_TOKEN=your-auth-token
   VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

#### Option 2: Continue with Direct Links (Current)
- Works for small scale
- Manual admin notifications
- Customer gets order confirmation
- No additional cost

---

## 🔒 Security Configuration

### HTTPS & Domain
```bash
# Vercel automatically provides:
# - HTTPS certificates
# - Custom domain support
# - Edge network CDN
```

### Security Headers
Already configured in `vercel.json`:
```json
{
  "headers": [
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "key": "X-Content-Type-Options", 
      "value": "nosniff"
    },
    {
      "key": "Referrer-Policy",
      "value": "strict-origin-when-cross-origin"
    }
  ]
}
```

### Admin Access Security
```javascript
// Current admin email: as.businezzz@gmail.com
// To change admin, update both files:
// - src/pages/AdminPanel.jsx
// - src/components/layout/Header.jsx
```

---

## 📊 Monitoring & Analytics

### Add Google Analytics (Optional)
```html
<!-- Add to index.html -->
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### Error Monitoring
Consider adding:
- **Sentry**: For error tracking
- **LogRocket**: For session replay
- **Hotjar**: For user behavior analytics

---

## 🧪 Pre-Launch Testing Checklist

### Functionality Testing
- ✅ User registration/login
- ✅ Product browsing (both categories)
- ✅ Cart functionality (add/remove/update)
- ✅ Wishlist functionality
- ✅ Checkout process
- ✅ Payment integration (test with small amounts)
- ✅ Order placement and confirmation
- ✅ WhatsApp notifications
- ✅ Admin panel (add/edit/delete products)
- ✅ Image uploads
- ✅ Mobile responsiveness
- ✅ Category switching

### Performance Testing
- ✅ Page load speeds
- ✅ Image optimization
- ✅ Mobile performance
- ✅ Database query performance

### Security Testing
- ✅ Authentication flows
- ✅ Admin access restrictions
- ✅ File upload security
- ✅ Payment security
- ✅ Database security policies

---

## 🌐 Custom Domain Setup

### Add Custom Domain to Vercel

1. **Purchase Domain** (GoDaddy, Namecheap, etc.)

2. **Add to Vercel**
   ```
   Project Settings → Domains → Add Domain
   ```

3. **Configure DNS**
   ```
   Type: A Record
   Name: @ (or subdomain)
   Value: 76.76.19.61 (Vercel IP)
   
   Type: CNAME
   Name: www
   Value: your-project.vercel.app
   ```

4. **SSL Certificate**
   - Automatically provided by Vercel
   - Force HTTPS redirect enabled

---

## 📞 Support & Maintenance

### Contact Information
- **Developer**: as.businezzz@gmail.com
- **WhatsApp**: +91 9173963720

### Regular Maintenance
- Monthly dependency updates
- Database backup verification
- Performance monitoring
- Security updates
- User feedback review

### Scaling Considerations
- **Database**: Upgrade Supabase plan as needed
- **Storage**: Monitor image storage usage
- **Payments**: Review transaction limits
- **WhatsApp**: Consider business API for scale

---

## 🎯 Go-Live Checklist

Before going live, ensure:

### Technical
- ✅ Production environment variables set
- ✅ Live payment keys configured
- ✅ Database properly set up
- ✅ SSL certificate active
- ✅ All features tested
- ✅ Error handling working
- ✅ Mobile responsiveness verified

### Business
- ✅ Product catalog ready
- ✅ Pricing finalized
- ✅ Shipping policies defined
- ✅ Return/refund policies set
- ✅ Customer support process ready
- ✅ Legal pages (Privacy, Terms) added

### Marketing
- ✅ Google Analytics configured
- ✅ Social media accounts ready
- ✅ Marketing materials prepared
- ✅ Launch announcement ready

---

## 🚀 Post-Launch Monitoring

### Week 1
- Monitor error logs daily
- Check payment transactions
- Verify WhatsApp notifications
- Monitor user registrations
- Check performance metrics

### Ongoing
- Weekly performance reviews
- Monthly security updates
- Quarterly feature updates
- Customer feedback integration

---

**Your ShopHub e-commerce platform is ready for production! 🎉**

For any issues during deployment, contact: as.businezzz@gmail.com