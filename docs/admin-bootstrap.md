# EveryGyan Safe Admin Bootstrap Guide

* **Purpose:** Safely elevate the first authorized user account to the `admin` role without hard-coding passwords or exposing credentials in Git or frontend code.

---

## 1. Security Architecture Background

1. **Strict Default Role:** When any user registers on EveryGyan via Supabase Auth, the database trigger `on_auth_user_created` automatically provisions their `profiles` row with the role set strictly to **`reader`**.
2. **Database Trigger Protection:** The PostgreSQL trigger `tr_protect_profile_role` intercepts any update to `profiles.role`. If a user attempts to update their own role via the client-side REST API, the database raises an exception and rejects the update.
3. **No Hard-Coded Backdoors:** There are no default admin passwords, client-side email lists, or special bypass flags in the codebase.

---

## 2. One-Time Admin Bootstrap Procedure

To designate the first administrator for your EveryGyan platform:

### Step 1: Register Your Account
1. Open the live site (or local development server).
2. Click **Login** > **Register**.
3. Create your personal account using your official owner/administrator email address (e.g. `sandeep@everygyan.com`).
4. Complete email verification if email confirmations are enabled in your Supabase Auth settings.

### Step 2: Elevate Role in Supabase SQL Editor
1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard/project/wttiswajotrmmrcwzqdy).
2. Open the **SQL Editor** on the left menu.
3. Run the following targeted SQL statement, replacing `'your-email@everygyan.com'` with your registered email:

```sql
-- Safe one-time admin elevation
UPDATE public.profiles
SET 
  role = 'admin',
  updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@everygyan.com'
);
```

### Step 3: Verify the Elevation
Run this read query in the SQL Editor to confirm:
```sql
SELECT p.id, u.email, p.full_name, p.role, p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'your-email@everygyan.com';
```

*Expected output:* `role` displays `admin`.

### Step 4: Sign Out and Sign In
Log out of EveryGyan and sign back in. Your session will load the verified `admin` role from PostgreSQL, granting full access to:
* The Editorial Dashboard (`/dashboard`)
* Article publishing & scheduling (`/dashboard/articles`)
* Comment moderation queue (`/dashboard/comments`)
* Subscriber management (`/dashboard/subscribers`)
* Newsletter broadcasts (`/dashboard/newsletter`)
