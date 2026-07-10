# Facilities Feedback - Action Item Management System

A full-stack Next.js application for collecting and managing facilities maintenance action items from survey feedback. Anyone can submit and browse action items; editing and deleting are protected by an admin secret (see `SECURITY.md`). The system includes Excel export and Power BI database connection support.

## Features

- ✅ **Submit Action Items**: Clean, intuitive form for submitting facilities maintenance action items (open to everyone)
- ✅ **Edit Existing Items**: The Edit page lists all action items; modifying them requires the admin secret
- ✅ **Layered Security**: Admin-secret-gated API mutations backed by restrictive Row Level Security policies
- ✅ **Excel Export**: Export all action items to Excel format
- ✅ **Power BI Integration**: Direct database connection support for Power BI
- ✅ **E2E Testing**: Comprehensive Playwright tests for all functionality
- ✅ **Modern UI**: Clean, professional design inspired by Solara AI

## Technology Stack

- **Frontend/Backend**: Next.js 16 with TypeScript and App Router
- **Database**: PostgreSQL via Supabase (free tier)
- **Styling**: Tailwind CSS
- **Testing**: Playwright for E2E tests
- **Excel Export**: xlsx library
- **Deployment**: Vercel (free tier compatible)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **API** to get your:
   - Project URL
   - Anon/public key
   - Service role key (used only by admin-gated API routes; treat it like a database password)

### 3. Create Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL script — this creates all tables and inserts dropdown data
4. Then run `supabase/migrations/002_harden_rls.sql` — this replaces the
   permissive RLS policies with the locked-down ones the app expects
   (public read + submit only; all other writes require the service role)

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:

   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ADMIN_SECRET=a_long_random_string
   ```

   **Security Note**: All four variables are server-only (no `NEXT_PUBLIC_`
   prefix), so none of them are compiled into browser JavaScript. The browser
   never talks to Supabase directly — everything goes through the API routes.
   See `SECURITY.md` for the full model.

   The app fails at startup with a clear error if the Supabase URL or anon
   key is missing or still set to a placeholder value; admin routes return
   errors if the service role key or admin secret is misconfigured.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
pulse/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main form page
│   ├── edit/              # Edit page (admin secret required to save)
│   ├── export/            # Export page
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions
├── types/                 # TypeScript definitions
├── e2e/                   # Playwright E2E tests
└── supabase/              # Database migrations
```

## Usage

### Submitting Action Items

1. Navigate to the home page
2. Fill in all required fields (marked with \*)
3. Select site, category, sub-category, and status from dropdowns
4. Enter action item description and optional notes
5. Click "Submit Action Item"

### Editing Action Items (admin)

1. Navigate to the "Edit Items" page — it lists all action items
2. Click "Edit" on the item you want to modify, then "Edit" again on the detail card
3. Update the fields and click "Update Action Item"
4. On first save you'll be prompted for the admin secret (the `ADMIN_SECRET`
   value); it's kept in `sessionStorage` for the rest of the tab session

### Managing Dropdowns (admin, API only)

There is no dropdown-management UI. Sites, categories, sub-categories, and
statuses are managed by calling the API directly with the admin secret, e.g.:

```powershell
curl -X POST https://your-app.vercel.app/api/sites `
  -H "Content-Type: application/json" `
  -H "x-admin-secret: your_admin_secret" `
  -d '{"name": "New Site"}'
```

The same pattern applies to `PUT`/`DELETE` on `/api/sites/[id]`,
`/api/categories`, `/api/sub-categories`, and `/api/statuses`.

### Exporting Data

1. Navigate to the "Export" page
2. Use the search box to filter action items (optional)
3. Click "Export to Excel" to download all data

## Power BI Connection

### Option 1: Direct Database Connection

1. Open Power BI Desktop
2. Click **Get Data** → **Database** → **PostgreSQL database**
3. Enter your Supabase connection details:
   - **Server**: `db.your-project-ref.supabase.co`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: (found in Supabase Settings → Database → Connection string)
   - **Port**: `5432`
4. Select the tables you want to import:
   - `action_items`
   - `sites`
   - `categories`
   - `sub_categories`
   - `statuses`

### Option 2: Connection String Format

```
Host=db.your-project-ref.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=your_password
```

### Recommended Queries

For a comprehensive view, create a query that joins all tables:

```sql
SELECT
  ai.id,
  ai.user_name,
  s.name AS site_name,
  c.name AS category_name,
  sc.name AS sub_category_name,
  ai.action_item,
  ai.estimated_completion_date,
  st.name AS status_name,
  ai.notes,
  ai.created_at,
  ai.updated_at
FROM action_items ai
LEFT JOIN sites s ON ai.site_id = s.id
LEFT JOIN categories c ON ai.category_id = c.id
LEFT JOIN sub_categories sc ON ai.sub_category_id = sc.id
LEFT JOIN statuses st ON ai.status_id = st.id
ORDER BY ai.created_at DESC;
```

## Running Tests

### E2E Tests with Playwright

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui
```

The tests cover:

- Form submission
- Editing action items (uses `ADMIN_SECRET` from `.env.local` for the protected routes)
- Export functionality
- Navigation between pages

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add all four environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET`) in Vercel project settings
4. Deploy!

The application is optimized for Vercel's free tier.

## Environment Variables

All variables are server-only — none are exposed to the browser.

| Variable                    | Description                              | Required | Security Note                                  |
| --------------------------- | ---------------------------------------- | -------- | ---------------------------------------------- |
| `SUPABASE_URL`              | Your Supabase project URL                | Yes      | Low sensitivity, but kept server-side          |
| `SUPABASE_ANON_KEY`         | Your Supabase anonymous key              | Yes      | Constrained by RLS (read + submit only)        |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin routes        | Yes      | **Secret — bypasses RLS entirely**             |
| `ADMIN_SECRET`              | Shared secret gating destructive routes  | Yes      | **Secret — grants edit/delete via the API**    |
| `PLAYWRIGHT_TEST_BASE_URL`  | Base URL for E2E tests                   | Optional | Development only                               |

## Database Schema

### Tables

- **action_items**: Main table storing action items
- **sites**: Available sites (managed via admin)
- **categories**: Main categories (managed via admin)
- **sub_categories**: Sub-categories linked to categories (managed via admin)
- **statuses**: Action item statuses (managed via admin)

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

## Free Tier Considerations

- **Supabase**: 500MB database, 2GB bandwidth (free tier)
- **Vercel**: Unlimited bandwidth, 100GB storage (free tier)
- All functionality works within free tier limits

## Troubleshooting

### Database Connection Issues

- Verify your Supabase credentials in `.env.local`
- Check that the database schema has been created (both migration files)
- If edits/deletes fail with 401, check the `x-admin-secret` header matches `ADMIN_SECRET`
- If admin routes fail with 500, verify `SUPABASE_SERVICE_ROLE_KEY` is set to the real key

### Form Not Submitting

- Check browser console for errors
- Verify API routes are working (check Network tab)
- Ensure all required fields are filled

### Dropdowns Not Loading

- Check that placeholder data was inserted
- Verify Supabase connection
- Check browser console for API errors

## Contributing

This is a learning project. Feel free to modify and extend it for your needs!

## License

This project is open source and available for educational purposes.

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Supabase and Next.js documentation
3. Check browser console and server logs for errors

---

**Built with ❤️ for facilities management teams**
