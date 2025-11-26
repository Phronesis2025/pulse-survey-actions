# Security Information

## Environment Variables Security

### Safe to Use in Vercel

All environment variables used in this application are **safe** to store in Vercel:

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - ✅ **Safe**: This is just a public URL to your Supabase project
   - It's designed to be public and is visible in the browser
   - No sensitive data is exposed

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - ✅ **Safe**: This is the "anonymous" or "public" key from Supabase
   - It's designed to be used in client-side code
   - **Protected by Row Level Security (RLS)**: Even if someone gets this key, they can only access data according to your RLS policies
   - The key itself doesn't grant admin access

### Vercel Security

- ✅ **Encrypted Storage**: All environment variables in Vercel are encrypted at rest
- ✅ **Access Control**: Only project members with appropriate permissions can view/edit variables
- ✅ **Not in Code**: Variables are never committed to your repository
- ✅ **Build-time Only**: Variables are injected during build/deployment, not stored in the final bundle (except `NEXT_PUBLIC_*` which are intentionally public)

### Database Security

This application uses **Row Level Security (RLS)** policies in Supabase:

- All tables have RLS enabled
- Permissive policies allow access for internal use
- The anon key can only perform operations allowed by RLS policies
- No admin/service role key is used (removed for security)

### Best Practices

1. **Never commit** `.env.local` or `.env` files to Git (already in `.gitignore`)
2. **Use Vercel's environment variables** for production secrets
3. **Rotate keys** if you suspect they've been compromised
4. **Monitor Supabase logs** for unusual activity
5. **Keep RLS enabled** - it provides an additional security layer

### What If Someone Gets the Anon Key?

If someone obtains your anon key:
- ✅ They can only access data according to your RLS policies
- ✅ They **cannot** bypass RLS (that requires the service role key, which we don't use)
- ✅ They **cannot** access other Supabase projects
- ✅ They **cannot** modify your Supabase project settings

### Additional Security Recommendations

1. **Monitor Access**: Check Supabase dashboard regularly for unusual activity
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **Input Validation**: All user inputs are validated (already implemented)
4. **HTTPS Only**: Vercel automatically uses HTTPS for all deployments

## Summary

✅ **It's safe to add these variables to Vercel**
- The variables are designed to be public
- They're protected by RLS policies
- Vercel stores them securely
- No sensitive admin keys are used

