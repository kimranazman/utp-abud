# Database

The backend is Supabase (Postgres, Auth, Storage, edge functions). The schema is defined by the SQL files in `supabase/migrations`, applied in filename order. Generated TypeScript types for every table live in `src/integrations/supabase/types.ts`.

## Tables

Created by the migrations:

**People**

- `profiles`, member profile information
- `user_roles`, role assignments such as admin
- `user_education`, education records
- `user_links`, personal and social links
- `career_history`, employment history
- `achievements`, awards and recognitions
- `contributions`, community contributions

**Businesses**

- `user_businesses`, businesses linked to a member
- `business_categories`, `business_subcategories`, `business_category_mapping`, the category tree
- `business_contact`, contact details
- `business_locations`, addresses and coordinates
- `business_images`, `business_gallery`, pictures
- `business_links`, external links
- `business_services`, `service_categories`, services offered
- `business_team_members`, people in a business
- `business_achievements`, business awards
- `business_metrics`, headline numbers
- `business_reviews`, reviews, public only once approved

**Messaging**

- `conversations`
- `conversation_participants`
- `messages`

**System**

- `app_config`, `site_settings`, application settings
- `security_audit_log`, record of sensitive operations

## Row level security

Tables are protected by row level security policies defined in the migrations. The client uses the anon key only, so every read and write goes through those policies. When you add a table, add its policies in the same migration.

## Storage

Uploaded files (avatars, business logos, banners, product photos) live in a public Supabase storage bucket named `images`. Upload and URL helpers are in `src/lib/imageUtils.ts`.

## Querying

Use the shared Supabase client. Nested selects follow the foreign keys:

```typescript
const { data } = await supabase
  .from('profiles')
  .select(`
    *,
    user_businesses (
      business_name,
      is_primary
    )
  `);
```

## Changing the schema

1. Add a new SQL file in `supabase/migrations` with a timestamp prefix.
2. Apply it with `supabase db push`.
3. Regenerate the types file if the change affects the frontend.
