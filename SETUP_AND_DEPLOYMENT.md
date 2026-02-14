# Setup and Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher (or yarn/pnpm)
- Git
- Supabase account

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd project
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Copy URL and Anon Key from Settings → API

### Step 4: Run Development Server
```bash
npm run dev
```

Server runs at: `http://localhost:5174`

### Step 5: Access Application
- **Admin Login**: Use admin email with role "admin"
- **Faculty Login**: Use faculty email with role "faculty"
- **Student Login**: Use student email with role "student"

## Database Setup

### Create Supabase Project

1. **Create Project**
   - Go to [Supabase](https://supabase.com)
   - Create new project
   - Choose region closest to users
   - Set strong database password

2. **Run Migrations**
   - Go to SQL Editor in Supabase
   - Create new query
   - Copy and run migration files:
     - `supabase/migrations/20260213085305_create_notifications_table.sql`
     - `supabase/migrations/20260213100000_enhance_notifications_table.sql`

3. **Enable RLS**
   - Go to Authentication → Policies
   - Verify RLS is enabled on notifications table
   - Check policies are active

4. **Set Auth Methods**
   - Go to Authentication → Providers
   - Enable Email/Password provider
   - Optionally enable social providers

## Production Deployment

### Option 1: Deploy to Vercel

1. **Push to GitHub**
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import repository
   - Configure environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click Deploy

3. **Verify Deployment**
   - Check deployment status
   - Test all features
   - Monitor performance

### Option 2: Deploy to Netlify

1. **Build for Production**
```bash
npm run build
```

2. **Deploy via Netlify CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Or use GitHub integration:
   - Connect repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables
   - Deploy

### Option 3: Deploy to Custom Server

1. **Build Application**
```bash
npm run build
```

2. **Deploy to Server** (using nginx)
```bash
# Copy dist folder to server
scp -r dist/ user@server:/var/www/notification-app/

# Configure nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.crt;
    ssl_certificate_key /path/to/key.key;

    root /var/www/notification-app/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **Enable HTTPS**
```bash
# Use Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

## Environment Variables

### Development (.env)
```env
VITE_SUPABASE_URL=https://[PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON-KEY]
```

### Production (.env.production)
```env
VITE_SUPABASE_URL=https://[PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON-KEY]
```

## Security Checklist

- [ ] Change Supabase database password
- [ ] Enable HTTPS on domain
- [ ] Set strong auth JWT expiry
- [ ] Enable RLS on all tables
- [ ] Review RLS policies
- [ ] Disable direct database access except via API
- [ ] Set up Web Application Firewall (WAF)
- [ ] Enable backup in Supabase
- [ ] Rotate API keys regularly
- [ ] Monitor authentication logs

## Performance Tuning

### Frontend
```bash
# Analyze bundle size
npm install --save-dev @vitejs/plugin-visualize
# Then check vite.config.ts for visualization
```

### Database
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM notifications WHERE priority = 'Critical';

-- Update table statistics
ANALYZE notifications;
```

## Monitoring and Maintenance

### Set up Monitoring
1. **Supabase Analytics**
   - Go to Supabase Dashboard → Analytics
   - Monitor API usage
   - Track database performance

2. **Error Tracking** (Optional)
   - Set up Sentry
   - Add error tracking to frontend

3. **Uptime Monitoring**
   - Use UptimeRobot or similar
   - Monitor endpoint availability

### Regular Maintenance
```bash
# Weekly: Run database optimization
VACUUM ANALYZE notifications;

# Monthly: Check logs and errors
# Review Supabase logs in Dashboard

# Quarterly: Test backup/restore
# Run disaster recovery drill
```

## Troubleshooting Deployment

### Issue: "VITE_SUPABASE_URL is not defined"
**Solution**: Check environment variables are set correctly in deployment platform

### Issue: CORS Errors
**Solution**: 
1. Go to Supabase Settings → API
2. Update CORS headers to include your domain
3. Redeploy application

### Issue: Rate Limiting
**Solution**:
1. Go to Supabase → Auth → Rate Limiting
2. Adjust limits based on expected traffic
3. Implement exponential backoff in client

### Issue: Database Connection Timeout
**Solution**:
1. Check database status in Supabase
2. Verify environment variables
3. Check firewall rules if self-hosted

## Scaling Considerations

### When to Scale Database
- Response times > 500ms
- Error rate > 0.1%
- Storage > 80% capacity

### How to Scale
1. **Vertical Scaling**: Increase database plan
2. **Read Replicas**: Add read-only replicas
3. **Connection Pooling**: Use PgBouncer

### Monitor Costs
- Check Supabase billing dashboard monthly
- Optimize queries to reduce API calls
- Archive old notifications periodically

## Backup Strategy

### Daily Backups
- Supabase performs automatic daily backups
- Retention: 7 days for free, up to 30 days for paid

### Export Data
```bash
# Export notifications table
pg_dump postgres://<user>:<password>@<host>/<db> \
  --table=notifications > backup.sql

# Import backup
psql postgres://<user>:<password>@<host>/<db> < backup.sql
```

### Recovery Procedure
1. Go to Supabase Dashboard → Backups
2. Select backup date
3. Click "Restore"
4. Wait for restoration to complete
5. Test application thoroughly

## Rollback Procedure

### If New Deployment Has Issues
```bash
# Revert to previous version on Vercel/Netlify
# Via dashboard: select previous deployment and click "Promote"

# Or via CLI
npm run build
npm run deploy -- --version <previous-version>
```

## API Rate Limits

Current Supabase limits (free tier):
- 50,000 API calls/month
- 10 requests/second
- 10MB data transfer/month

Paid plans have higher limits.

## Logging and Debugging

### Enable Debug Mode
```typescript
// In src/main.tsx
if (process.env.NODE_ENV === 'development') {
  window.DEBUG_MODE = true;
}
```

### View Logs
- Browser Console: F12 → Console
- Supabase: Dashboard → Logs → Edge Logs
- Application Logs: Check server logs

## Support and Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind Docs**: https://tailwindcss.com/docs

---

**Last Updated**: February 13, 2026
**Version**: 1.0.0
