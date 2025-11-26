# Facilities Feedback - Action Item Management System

A full-stack Next.js application for collecting and managing facilities maintenance action items from survey feedback. Users can submit action items, search and edit their own items by name, and administrators can manage dropdown options. The system includes Excel export and Power BI database connection support.

## Features

- ✅ **Submit Action Items**: Clean, intuitive form for submitting facilities maintenance action items
- ✅ **Edit Existing Items**: Search by name to find and edit previously submitted action items
- ✅ **Admin Panel**: Manage dropdown options for sites, categories, sub-categories, and statuses
- ✅ **Excel Export**: Export all action items to Excel format
- ✅ **Power BI Integration**: Direct database connection support for Power BI
- ✅ **E2E Testing**: Comprehensive Playwright tests for all functionality
- ✅ **Modern UI**: Clean, professional design inspired by Solara AI

## Technology Stack

- **Frontend/Backend**: Next.js 14+ with TypeScript and App Router
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
   - Service role key (optional, for server-side operations)

### 3. Create Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL script
4. This will create all necessary tables and insert placeholder data

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
   
   **Security Note**: These variables are safe to use. The `NEXT_PUBLIC_` prefix means they'll be exposed in the browser, but:
   - The URL is just a public endpoint
   - The anon key is protected by Row Level Security (RLS) policies
   - Vercel environment variables are encrypted and secure

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
│   ├── edit/              # Edit/search page
│   ├── admin/             # Admin panel
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

### Editing Action Items

1. Navigate to the "Edit Items" page
2. Enter your name (exact match required)
3. Click "Search"
4. Click "Edit" on any item you want to modify
5. Update the fields and click "Update Action Item"

### Managing Dropdowns (Admin)

1. Navigate to the "Admin" page
2. Use the four sections to manage:
   - **Sites**: Add, edit, or delete site options
   - **Categories**: Add, edit, or delete category options
   - **Sub-Categories**: Add, edit, or delete sub-category options
   - **Statuses**: Add, edit, or delete status options

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
- Editing action items
- Admin dropdown management
- Export functionality
- Navigation between pages

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel project settings
4. Deploy!

The application is optimized for Vercel's free tier.

## Environment Variables

| Variable                        | Description                            | Required | Security Note |
| ------------------------------- | -------------------------------------- | -------- | ------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL              | Yes      | Safe - Public URL only |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key            | Yes      | Safe - Protected by RLS policies |
| `PLAYWRIGHT_TEST_BASE_URL`      | Base URL for E2E tests                 | Optional | Development only |

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
- Check that the database schema has been created
- Ensure Row Level Security (RLS) is disabled or proper policies are set

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
