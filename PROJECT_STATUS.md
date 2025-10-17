# NolaLocal - Project Status Document

**Last Updated:** October 14, 2025  
**Status:** DEPLOYED TO PRODUCTION ✅  
**Live URL:** https://nolalocal.vercel.app

---

## Project Overview

NolaLocal is a community-driven event discovery platform for New Orleans. Full-stack Next.js application with MongoDB, authentication, image uploads, and admin dashboard.

---

## Current Deployment Status

- ✅ Deployed to Vercel (Production)
- ✅ MongoDB Atlas connected and working
- ✅ SendGrid email verification working
- ✅ Cloudinary image uploads working
- ✅ Pull request open for Springboard review
- ✅ Auto-deployment enabled (push to dev branch = auto-deploy)

---

## Repository Information

**GitHub Repo:** https://github.com/Laruschkaj/capstone-nolalocal  
**Pull Request:** https://github.com/Laruschkaj/capstone-nolalocal/pull/1  
**Branch Structure:**

- `main` - Production branch (for Springboard submission, DO NOT MERGE)
- `dev` - Active development branch (deploys to Vercel automatically)

---

## Tech Stack

- Next.js 15.5.4 (App Router)
- TypeScript
- MongoDB Atlas
- Tailwind CSS
- Cloudinary (image hosting)
- SendGrid (email)
- Vercel (hosting)

---

## Project Structure

```
Capstone-NolaLocal/
├── 01project-proposal/
├── 02frontend-specs/
├── 03database-model/
├── 04api-specs/
├── nolalocalapp/          ← Main application folder
│   ├── src/
│   │   ├── app/           ← Pages and API routes
│   │   ├── components/    ← React components
│   │   ├── contexts/      ← AuthContext, ThemeContext
│   │   ├── lib/           ← Database, helpers, services
│   │   ├── models/        ← MongoDB schemas
│   │   └── middleware.ts  ← Auth middleware
│   ├── public/
│   ├── next.config.ts
│   ├── package.json
│   └── .env.local         ← Environment variables (not in git)
├── README.md
└── PROJECT_STATUS.md      ← This file
```

---

## Important Files to Know

### Core Configuration

- `nolalocalapp/next.config.ts` - Next.js config (has eslint/typescript errors disabled for production)
- `nolalocalapp/package.json` - Dependencies
- `nolalocalapp/.env.local` - Environment variables (LOCAL ONLY, not in git)

### Key Components

- `nolalocalapp/src/contexts/AuthContext.tsx` - Authentication logic
- `nolalocalapp/src/contexts/ThemeContext.tsx` - Dark/light mode
- `nolalocalapp/src/components/layout/Navigation.tsx` - Main navigation
- `nolalocalapp/src/components/layout/HeroSection.tsx` - Landing page hero
- `nolalocalapp/src/components/events/EventCard.tsx` - Event display cards

### API Routes (Important)

- `nolalocalapp/src/app/api/auth/` - Authentication endpoints
- `nolalocalapp/src/app/api/events/` - Event CRUD operations
- `nolalocalapp/src/app/api/admin/` - Admin dashboard

### Database

- `nolalocalapp/src/lib/dbConnect.ts` - MongoDB connection
- `nolalocalapp/src/models/` - Mongoose schemas (User, Event, Category)

---

## Environment Variables (Vercel Production)

All set up in Vercel dashboard:

- MONGODB_URI
- JWT_SECRET
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
- SENDGRID_API_KEY
- SENDGRID_FROM_EMAIL
- NEXT_PUBLIC_OPENWEATHER_API_KEY
- NODE_ENV=production

---

## Deployment Workflow

1. Make changes in VS Code
2. Test locally: `cd nolalocalapp && npm run dev`
3. Commit: `git add . && git commit -m "description"`
4. Push: `git push origin dev`
5. Vercel automatically detects and deploys (2-3 minutes)
6. Check: https://vercel.com/laruschkas-projects/capstone-nolalocal/deployments

**Important:** Database (MongoDB) is separate from deployment. User data persists across deployments.

---

## Current Issues & Improvement Plan

### Phase 1 (CRITICAL - In Progress)

1. **Hide past events** - Events with dates < today should not show

   - File: `nolalocalapp/src/app/api/events/route.ts`
   - Add filter: `query.date = { $gte: new Date() }`

2. **Fix navigation for non-logged users** - Nav shows all options but redirects to home

   - File: `nolalocalapp/src/components/layout/Navigation.tsx`
   - Only show Sign Up/Login buttons when not authenticated

3. **Fix "Invalid Date" on guides** - Guides without dates show "Invalid Date"
   - Files: `nolalocalapp/src/components/events/EventCard.tsx`, `CalendarEventCard.tsx`
   - Show "Evergreen" or hide date when no date exists

### Phase 2 (HIGH PRIORITY - Next)

4. Separate events and guides on /events page
5. Rename "Featured Events" section to "Latest Additions"
6. Move "View All Events" button up

### Phase 3 (MEDIUM PRIORITY - This Week)

7. Hero image transition speed (fade faster)
8. Calendar dark mode fix (date selector background)
9. Mobile table responsiveness (horizontal scroll)

### Phase 4 (POLISH - Next Week)

10. Modernize date/time pickers
11. Category dropdown styling
12. Auto-scroll to featured section
13. Debug Ticketmaster sync (showing 0 new events)

---

## Known Issues

1. **Ticketmaster Sync:** Not fetching new events, returns 0. Need to investigate API limits and logs.
2. **Old Events Showing:** Need to filter by date to hide past events.
3. **Calendar Filter (Mobile):** Filter dropdown goes under event cards instead of on top.
4. **Guides on /events:** Guide items showing in events tab (should be separate).

---

## Testing Checklist (Before Each Deployment)

- [ ] Test locally with `npm run dev`
- [ ] Sign up with new email works
- [ ] Login/logout works
- [ ] Create event works
- [ ] Image upload works
- [ ] Dark mode toggle works
- [ ] Mobile responsive
- [ ] No console errors

---

## Important Notes for New AI Assistant

1. **Do NOT merge the pull request** - It must stay open for Springboard mentor review
2. **Always test locally first** before pushing to dev
3. **Database is separate** - Changes to code don't affect existing user data
4. **Auto-deployment is active** - Every push to dev triggers new deployment
5. **Use semantic commits** - Clear commit messages help track changes
6. **Vercel config is set** - Root directory is `nolalocalapp`, build command is `npm run build`
7. **Linting/TypeScript errors are disabled** for production (in next.config.ts)
8. **No localStorage/sessionStorage** issues anymore - using proper React state
9. **Theme system works** - Uses CSS variables and ThemeContext
10. **Forms use native HTML5** date/time inputs (need to modernize styling)

---

## Quick Commands Reference

```bash
# Navigate to app folder
cd ~/Documents/SPRINGBOARD-MAC/Capstone-NolaLocal/nolalocalapp

# Install dependencies
npm install

# Run locally
npm run dev

# Build for production (test before deploying)
npm run build

# Commit and push (triggers auto-deploy)
git add .
git commit -m "fix: description of changes"
git push origin dev

# Deploy via CLI (if needed)
vercel --prod
```

---

## Contact & Resources

- **Live App:** https://nolalocal.vercel.app
- **Vercel Dashboard:** https://vercel.com/laruschkas-projects/capstone-nolalocal
- **MongoDB Atlas:** https://cloud.mongodb.com
- **GitHub Repo:** https://github.com/Laruschkaj/capstone-nolalocal

---

## Success Criteria (Springboard Submission)

- [x] Full-stack application deployed
- [x] User authentication with email verification
- [x] CRUD operations (Events, Guides)
- [x] Admin dashboard
- [x] Responsive design
- [x] Dark/light mode
- [x] Image uploads
- [x] Professional documentation
- [x] Open pull request for review
- [ ] All Phase 1-2 improvements complete (in progress)

---

**Next Steps:** Complete Phase 1 improvements (hide past events, fix navigation, fix invalid date).

---

End of Project Status Document
