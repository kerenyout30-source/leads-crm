# Deployment Guide - Leads CRM to Vercel

## Status: ✅ READY FOR DEPLOYMENT

Your Leads CRM application is fully built and ready for production deployment to Vercel.

---

## Phase 1: GitHub Setup (User Action Required)

Since you need to use your GitHub account, follow these steps:

### 1. Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Repository name:** `leads-crm`
   - **Description:** Hebrew RTL Dark-Mode CRM Web App
   - **Visibility:** Public (required for Vercel free tier) or Private
   - **Initialize repository:** Leave unchecked (we'll push existing code)
   - Click **Create repository**

### 2. Push Code to GitHub

In your terminal, run these commands (replace `YOUR_USERNAME` with your GitHub username):

```bash
cd "c:\Users\keren\OneDrive\Documents\AI\פרויקטים\מערכת לידים קאש פלואו\leads-crm"

git remote add origin https://github.com/YOUR_USERNAME/leads-crm.git
git branch -M main
git push -u origin main
```

Your project is now on GitHub!

---

## Phase 2: Vercel Deployment

### 1. Connect Vercel to GitHub

1. Go to https://vercel.com/new
2. Sign in with your GitHub account (or create a Vercel account)
3. Click **Import Git Repository**
4. Find and select `leads-crm` from your GitHub repositories
5. Click **Import**

### 2. Configure Environment Variables

On the Vercel import screen, add the following environment variables:

| Variable Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qwwweztgjhrpbkcirsbm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_AimbCYbbGwWZyOJ8iR2XeA_bcB_dqNO` |

**Note:** These are your Supabase public keys and are safe to commit (hence the `NEXT_PUBLIC_` prefix).

### 3. Deploy

Click **Deploy** and wait for the build to complete. This typically takes 2-5 minutes.

---

## Phase 3: Verify Deployment

Once deployment is complete:

1. Vercel will provide your deployment URL (e.g., `https://leads-crm.vercel.app`)
2. Click the link to verify the application loads correctly
3. Test the login, leads list, and basic functionality

---

## Project Information

**Framework:** Next.js 16.2.6  
**Runtime:** Node.js 18+ (Vercel default)  
**Database:** Supabase  
**Styling:** Tailwind CSS 4  
**Language:** TypeScript  

**Key Features:**
- Hebrew RTL dark-mode interface
- Lead management with CRUD operations
- Kanban board view with drag-and-drop
- Lead activity timeline
- Bulk Excel import with preview
- Search and filtering
- Responsive design

---

## Production Checklist

- ✅ `.env.local` is in `.gitignore` (secrets won't be committed)
- ✅ All code committed to git
- ✅ Production build tested locally (`npm run build`)
- ✅ TypeScript compilation successful
- ✅ No missing dependencies
- ✅ Environment variables configured for Vercel

---

## Troubleshooting

### Build Fails on Vercel
- Check the Vercel build logs for specific error messages
- Verify environment variables are set correctly
- Ensure Supabase database is accessible

### Login Not Working
- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct in Vercel settings
- Check Supabase project settings to ensure they match

### Database Connection Issues
- Verify your Supabase project is still active
- Check Supabase project settings for the correct credentials
- Ensure your Supabase RLS (Row Level Security) policies allow the Anon key

---

## Next Steps After Deployment

1. Set up a custom domain (optional):
   - In Vercel project settings → Domains
   - Add your domain (e.g., `crm.yourcompany.com`)

2. Configure CI/CD:
   - Vercel automatically deploys on `main` branch push
   - Preview deployments created for pull requests

3. Monitor performance:
   - Use Vercel Analytics dashboard
   - Monitor database queries in Supabase

4. Set up backups:
   - Configure Supabase automated backups if needed

---

## Git Repository Details

**Branch:** main  
**Commits:** 10+ features implemented  
**Build Status:** ✅ Production build tested and passing  

Recent commits:
- feat: Excel import with preview and bulk insert
- fix: optimize kanban performance, add accessibility
- feat: Kanban view with drag-and-drop status update
- feat: Lead activity timeline in drawer
- feat: Lead drawer with create/edit/delete and validation
- And 5+ more feature commits

---

## Support

If you encounter issues during deployment:

1. Check the Vercel build logs
2. Verify all environment variables are set
3. Test locally with `npm run build && npm run start`
4. Review the Supabase documentation for authentication issues

Good luck with your deployment! 🚀
