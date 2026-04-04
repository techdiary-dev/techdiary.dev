# Job Listing — Master Plan

**Date:** 2026-04-05  
**Status:** Draft

---

## 1. What We Are Building

A job board embedded inside TechDiary where companies can post tech jobs and community members can discover and apply — all without leaving the platform.

Companies are shared workspaces with roles. Multiple TechDiary users can belong to the same company and collaborate on job postings and applications.

Key URLs:

- `/jobs` — public job board
- `/jobs/[handle]` — job detail page
- `/companies/[handle]` — public company page
- `/dashboard/jobs` — manage job postings
- `/dashboard/company` — manage company profile and members

---

## 2. Actors

### Job Seeker

- Any visitor (logged in or not) can browse the job board and read job details.
- Login required to: bookmark a job, leave a comment/question.
- To apply: sent to an external link or email — no in-platform application flow in V1.

### Company Member (Job Poster)

- A TechDiary user who belongs to a company (as Owner or Manager).
- Can create job posts under their company.
- Can view applications and participate in internal conversations.

### Company Owner

- The user who created the company. Has full control.
- Only one Owner per company at a time.

### Company Manager

- Invited by the Owner or joined via secret code.
- Can do most things but cannot publish jobs or manage members.
- A Manager can belong to multiple companies (e.g. a freelance recruiter).

### Platform Admin (TechDiary team)

- Can remove or hide any job listing or company that violates guidelines.
- No special moderation dashboard needed in V1.

---

## 3. Company System

### 3.1 Company Profile

A company is not a separate account. It is created by a TechDiary user who becomes its Owner. The company gets its own public page at `/companies/[handle]`.

**Company profile fields:**

| Field             | Required?                      |
| ----------------- | ------------------------------ |
| Company name      | Yes                            |
| Handle (URL slug) | Yes — auto-generated from name |
| Logo              | No                             |
| Website           | No                             |
| About             | No                             |
| Location          | No                             |
| Industry          | No — e.g. Fintech, EdTech      |
| Company size      | No — e.g. 1–10, 11–50, 51–200  |

### 3.2 Roles

|                      | Owner                            | Manager                           |
| -------------------- | -------------------------------- | --------------------------------- |
| Who gets this role   | The user who created the company | Anyone invited or joined via code |
| How many per company | One                              | Unlimited                         |

**Permissions:**

| Action                             | Owner | Manager |
| ---------------------------------- | :---: | :-----: |
| Edit company profile               |   ✓   |    ✗    |
| Invite member by username          |   ✓   |    ✗    |
| Generate / rotate join secret code |   ✓   |    ✗    |
| Remove a member                    |   ✓   |    ✗    |
| Transfer ownership                 |   ✓   |    ✗    |
| Delete company                     |   ✓   |    ✗    |
| Create a job post (draft)          |   ✓   |    ✓    |
| Publish a job post                 |   ✓   |    ✗    |
| Change job status (close, reopen)  |   ✓   |    ✗    |
| View applications                  |   ✓   |    ✓    |
| Post in internal conversation      |   ✓   |    ✓    |

### 3.3 How Members Join

**Path 1 — Direct invite by Owner**

1. Owner goes to Dashboard → Company → Members → Invite.
2. Types a TechDiary username (e.g. `@alice`).
3. Alice receives a TechDiary notification.
4. She clicks Accept → becomes a Manager.
5. If she declines, the invite is removed.

**Path 2 — Join via secret code**

1. Owner shares a short code (e.g. `XK9-TZQ`) off-platform (Slack, email, etc.).
2. The person goes to any company page and clicks "Join with code", or via a global join page.
3. They must be a logged-in TechDiary user.
4. They are added immediately as Manager — no approval step needed.
5. Owner can rotate the code at any time. Old code stops working instantly.

### 3.4 Owner Cannot Leave Without a Plan

To prevent ownerless companies, the Owner must either:

- **Transfer ownership** → promotes a Manager to Owner, original Owner becomes Manager, or
- **Delete the company** → removes the company and all its job listings.

---

## 4. Core User Journeys

### Creating a Company

1. User goes to Dashboard → Company → Create Company.
2. Fills in company name, logo, website, about, etc.
3. Saves → becomes the Owner. Company is live at `/companies/[handle]`.

### Inviting / Joining a Company

- **Invite path:** Owner types `@username` → target user gets notification → accepts → becomes Manager.
- **Code path:** Owner copies code from Dashboard → Company → Settings → shares it → recipient logs in and enters code → becomes Manager.

### Posting a Job

1. User goes to Dashboard → Jobs → Post a Job.
2. A **Company** dropdown appears listing every company they belong to.
3. They select a company — name, logo pre-fill automatically.
4. They fill in the job details (see fields below).
5. **Manager** saves as draft. **Owner** can save as draft or publish directly.
6. The Owner reviews drafts and publishes.

**Job fields:**

- Title
- Job description (Markdoc markdown editor — same as articles)
- Location (city or "Remote")
- Is remote (toggle)
- Job type: Full-time, Part-time, Contract, Freelance, Internship
- Experience level: Junior, Mid, Senior, Lead
- Salary range (optional — min, max, currency)
- Tags (e.g. React, Python, DevOps — from the existing tag system)
- How to apply: external URL or email address
- Expiry date (listing auto-hides after this date)

### Browsing the Job Board

1. Any visitor goes to `/jobs`.
2. Sees a paginated list of published, non-expired jobs (newest first).
3. Can filter by: job type, experience level, remote, tags.
4. Clicks a job card to view the full detail page.
5. Clicks Apply → opens the external URL or email client.

### Saving a Job

1. Logged-in user clicks the bookmark icon on a job card or detail page.
2. Job is saved to Dashboard → Bookmarks (same place as article bookmarks).

### Asking Questions on a Job

1. On the job detail page, logged-in users leave a public comment.
2. The job poster gets a TechDiary notification and can reply.
3. Thread is visible to all visitors.

### Viewing Applications

- Internal application tracking is out of scope for V1 (apply goes to external link).
- Internal conversation (for future V2 when in-platform applications are added) is designed in the database but not built in V1.

### Managing Posted Jobs

1. Dashboard → Jobs shows a table: all drafts, published, and expired listings.
2. Actions per row: Edit, Publish/Unpublish (Owner only), Delete.
3. Expired listings stay in the dashboard but are hidden from the public board.

### Managing Company Members

1. Dashboard → Company → Members shows a table of all members with their role and join date.
2. Owner sees a Remove button for every Manager.
3. Owner sees the join secret code and can rotate it.
4. Managers see the list but no management actions.

---

## 5. Public Pages

### `/jobs` — Job Board

- Uses `HomepageLayout` (same 3-column grid as homepage).
- Center: paginated `JobCard` list, infinite scroll via `useInfiniteQuery`.
- Left sidebar: filters (job type, experience, remote toggle, tags).
- Right sidebar: featured companies or trending tech tags.

### `/jobs/[handle]` — Job Detail

- Server component, cached with `"use cache"` + `cacheTag`.
- Company header: logo, name, website link.
- Job metadata: type, location, salary range, experience level.
- Body: rendered Markdoc (same renderer as articles).
- Apply CTA: external link button or `mailto:` link.
- Tags, bookmark button, public comment section (reuse `CommentSection`).

### `/companies/[handle]` — Company Page

- Company name, logo, about, website link.
- All open job listings posted under this company.
- Simple layout — no followers, no feed, no complex layout.

---

## 6. Database Schema

### `company_profiles`

| Column      | Type      | Notes                                         |
| ----------- | --------- | --------------------------------------------- |
| id          | UUID      | Primary key                                   |
| name        | varchar   | Company name                                  |
| handle      | varchar   | Unique, used in URL                           |
| logo        | jsonb     | `IServerFile` — same as article cover         |
| website     | varchar   |                                               |
| about       | text      |                                               |
| location    | varchar   |                                               |
| industry    | varchar   |                                               |
| size        | varchar   | e.g. "11-50"                                  |
| join_secret | varchar   | Short code for self-join (7 chars, uppercase) |
| created_at  | timestamp |                                               |
| updated_at  | timestamp |                                               |

### `company_members`

| Column        | Type      | Notes                                |
| ------------- | --------- | ------------------------------------ |
| id            | UUID      | Primary key                          |
| company_id    | UUID      | FK → company_profiles                |
| user_id       | UUID      | FK → users                           |
| role          | varchar   | `OWNER` or `MANAGER`                 |
| invited_by_id | UUID      | FK → users — null if joined via code |
| joined_at     | timestamp |                                      |

Unique constraint: `(company_id, user_id)` — a user can only belong to a company once.

### `company_invites`

| Column          | Type      | Notes                             |
| --------------- | --------- | --------------------------------- |
| id              | UUID      | Primary key                       |
| company_id      | UUID      | FK → company_profiles             |
| invited_user_id | UUID      | FK → users                        |
| invited_by_id   | UUID      | FK → users                        |
| status          | varchar   | `PENDING`, `ACCEPTED`, `DECLINED` |
| created_at      | timestamp |                                   |

### `job_listings`

| Column             | Type      | Notes                                                           |
| ------------------ | --------- | --------------------------------------------------------------- |
| id                 | UUID      | Primary key                                                     |
| handle             | varchar   | Unique URL slug                                                 |
| title              | varchar   |                                                                 |
| company_profile_id | UUID      | FK → company_profiles (nullable)                                |
| company_name       | varchar   | Fallback if no company profile linked                           |
| company_logo       | jsonb     | `IServerFile` — fallback if no profile                          |
| company_website    | varchar   | Fallback if no profile                                          |
| body               | text      | Markdoc content                                                 |
| excerpt            | varchar   | Short description for cards                                     |
| location           | varchar   | e.g. "Remote", "Dhaka, BD"                                      |
| is_remote          | boolean   |                                                                 |
| job_type           | varchar   | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `FREELANCE`, `INTERNSHIP` |
| experience_level   | varchar   | `JUNIOR`, `MID`, `SENIOR`, `LEAD`, `ANY`                        |
| salary_min         | integer   |                                                                 |
| salary_max         | integer   |                                                                 |
| salary_currency    | varchar   | Default `USD`                                                   |
| apply_url          | varchar   | External apply link                                             |
| apply_email        | varchar   | Or apply via email                                              |
| posted_by_id       | UUID      | FK → users                                                      |
| published_at       | timestamp | Null = draft                                                    |
| expires_at         | timestamp | Auto-hide after this date                                       |
| created_at         | timestamp |                                                                 |
| updated_at         | timestamp |                                                                 |

### `job_listing_tags` (pivot)

| Column         | Type | Notes             |
| -------------- | ---- | ----------------- |
| id             | UUID | Primary key       |
| job_listing_id | UUID | FK → job_listings |
| tag_id         | UUID | FK → tags         |

### No new tables for:

- **Bookmarks** — extend `resource_type` to include `"JOB"`.
- **Comments** — extend `resource_type` to include `"JOB"`.

---

## 7. Domain Models

Add to `src/backend/models/domain-models.ts`:

```ts
export type JOB_TYPE =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "FREELANCE"
  | "INTERNSHIP";
export type EXPERIENCE_LEVEL = "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "ANY";
export type COMPANY_ROLE = "OWNER" | "MANAGER";
export type COMPANY_INVITE_STATUS = "PENDING" | "ACCEPTED" | "DECLINED";

export interface CompanyProfile {
  id: string;
  name: string;
  handle: string;
  logo?: IServerFile;
  website?: string;
  about?: string;
  location?: string;
  industry?: string;
  size?: string;
  join_secret?: string; // only exposed to Owner
  members?: CompanyMember[];
  created_at?: Date;
  updated_at?: Date;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: COMPANY_ROLE;
  invited_by_id?: string;
  joined_at?: Date;
  user?: User;
}

export interface CompanyInvite {
  id: string;
  company_id: string;
  invited_user_id: string;
  invited_by_id: string;
  status: COMPANY_INVITE_STATUS;
  created_at?: Date;
}

export interface JobListing {
  id: string;
  handle: string;
  title: string;
  company_profile_id?: string;
  company_name: string;
  company_logo?: IServerFile;
  company_website?: string;
  body?: string;
  excerpt?: string;
  location?: string;
  is_remote: boolean;
  job_type: JOB_TYPE;
  experience_level?: EXPERIENCE_LEVEL;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  apply_url?: string;
  apply_email?: string;
  posted_by_id: string;
  published_at?: Date;
  expires_at?: Date;
  tags?: Tag[];
  company?: CompanyProfile;
  posted_by?: User;
  created_at?: Date;
  updated_at?: Date;
}
```

---

## 8. Backend Services

### Repositories

Add to `persistence-repositories.ts`:

```ts
companyProfile: new Repository(pgClient, "company_profiles"),
companyMember:  new Repository(pgClient, "company_members"),
companyInvite:  new Repository(pgClient, "company_invites"),
jobListing:     new Repository(pgClient, "job_listings"),
jobListingTag:  new Repository(pgClient, "job_listing_tags"),
```

### `company.actions.ts`

| Action                                 | Who can call       | Description                                  |
| -------------------------------------- | ------------------ | -------------------------------------------- |
| `createCompany(input)`                 | Any logged-in user | Creates company, caller becomes Owner        |
| `updateCompany(input)`                 | Owner only         | Update profile fields                        |
| `deleteCompany(id)`                    | Owner only         | Delete company + all listings                |
| `getCompanyByHandle(handle)`           | Anyone             | Public page data — `"use cache"`             |
| `getMyCompanies()`                     | Logged-in user     | All companies the user belongs to            |
| `inviteMember(companyId, username)`    | Owner only         | Creates a PENDING invite, sends notification |
| `respondToInvite(inviteId, accept)`    | Invited user       | Accepts or declines                          |
| `joinWithCode(code)`                   | Any logged-in user | Validates code, adds as Manager instantly    |
| `removeMember(companyId, userId)`      | Owner only         | Removes a Manager                            |
| `rotateJoinSecret(companyId)`          | Owner only         | Generates new 7-char code                    |
| `transferOwnership(companyId, userId)` | Owner only         | Swaps Owner ↔ Manager roles                  |

### `job.actions.ts`

| Action                             | Who can call          | Description                                               |
| ---------------------------------- | --------------------- | --------------------------------------------------------- |
| `createJobListing(input)`          | Company member        | Creates draft. Auto-generates handle from title.          |
| `updateJobListing(input)`          | Owner or draft author | Update fields. Busts cache.                               |
| `publishJobListing(id)`            | Owner only            | Sets `published_at = now()`. Syncs to search.             |
| `closeJobListing(id)`              | Owner only            | Sets `expires_at = now()` effectively closing it.         |
| `deleteJobListing(id)`             | Owner only            | Hard delete. Removes from search index.                   |
| `getJobListings(input)`            | Anyone                | Paginated public list — excludes unpublished and expired. |
| `getJobListingByHandle(handle)`    | Anyone                | Single job detail — `"use cache"` + `cacheTag`.           |
| `getCompanyJobListings(companyId)` | Anyone                | All published jobs for a company page.                    |
| `getMyJobListings()`               | Logged-in user        | Dashboard: all drafts + published by current user.        |

### Input Schemas (`job.input.ts`, `company.input.ts`)

```ts
// job.input.ts
const createJobInput = z.object({
  title: z.string().min(5).max(200),
  company_profile_id: z.string().uuid().optional(),
  company_name: z.string().min(2).max(100),
  company_website: z.string().url().optional().or(z.literal("")),
  body: z.string().optional(),
  excerpt: z.string().max(300).optional(),
  location: z.string().optional(),
  is_remote: z.boolean().default(false),
  job_type: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "FREELANCE",
    "INTERNSHIP",
  ]),
  experience_level: z
    .enum(["JUNIOR", "MID", "SENIOR", "LEAD", "ANY"])
    .optional(),
  salary_min: z.number().positive().optional(),
  salary_max: z.number().positive().optional(),
  salary_currency: z.string().default("USD"),
  apply_url: z.string().url().optional().or(z.literal("")),
  apply_email: z.string().email().optional().or(z.literal("")),
  expires_at: z.string().datetime().optional(),
  tag_ids: z.array(z.string().uuid()).default([]),
});

const listJobsInput = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  job_type: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "INTERNSHIP"])
    .optional(),
  experience_level: z
    .enum(["JUNIOR", "MID", "SENIOR", "LEAD", "ANY"])
    .optional(),
  is_remote: z.boolean().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
  q: z.string().optional(),
});
```

---

## 9. Caching Strategy

```ts
// Reader — safe to cache
export async function getJobListingByHandle(handle: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`job-${handle}`);
  // ...
}

export async function getCompanyByHandle(handle: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`company-${handle}`);
  // ...
}

// Writer — bust cache after mutation
export async function updateJobListing(input) {
  // ... update DB
  revalidateTag(`job-${payload.handle}`);
}

export async function updateCompany(input) {
  // ... update DB
  revalidateTag(`company-${payload.handle}`);
}
```

`getJobListings()` (feed) → `cacheLife("minutes")`.

---

## 10. Routes

```
/jobs                           Public job board
/jobs/[handle]                  Job detail page
/companies/[handle]             Public company page

/dashboard/jobs                 My job postings (all companies I'm in)
/dashboard/jobs/new             Create new job
/dashboard/jobs/[id]            Edit job

/dashboard/company              My company (create if none, or manage existing)
/dashboard/company/members      Member list + invite
/dashboard/company/settings     Edit profile, rotate join secret
```

---

## 11. New Components

| Component                | Purpose                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `JobCard.tsx`            | Card for job board — title, company logo, tags, salary, type badge |
| `JobEditor.tsx`          | Create/edit form with company dropdown                             |
| `JobTypeBadge.tsx`       | Color-coded badge (Full-time, Remote, etc.)                        |
| `SalaryRange.tsx`        | Formatted salary display                                           |
| `CompanyMemberTable.tsx` | Member list with remove button (owner view)                        |
| `JoinWithCodeForm.tsx`   | Input + submit for joining via secret code                         |
| `InviteMemberForm.tsx`   | Username lookup + invite send                                      |

---

## 12. Search Integration

MeilSearch index: `job_listings`

- **Searchable:** `title`, `company_name`, `body`, `excerpt`, `location`
- **Filterable:** `job_type`, `is_remote`, `experience_level`, `tag_ids`, `company_profile_id`
- **Sortable:** `published_at`

Add `syncJobListingById()` in `job.service.ts`:

- Call on `publishJobListing()` and `updateJobListing()` (if already published).
- Remove from index on `deleteJobListing()` and `closeJobListing()`.

---

## 13. Sitemap

Add `src/app/sitemaps/jobs-sitemap.ts` — queries all published, non-expired jobs, emits `/jobs/[handle]` URLs.
Add `src/app/sitemaps/companies-sitemap.ts` — emits `/companies/[handle]` URLs.

---

## 14. i18n

Add Bengali keys to `src/i18n/bn.json`:

- `jobs.title`, `jobs.post_a_job`, `jobs.apply_now`, `jobs.remote`, `jobs.salary`
- `company.create`, `company.members`, `company.invite`, `company.join_with_code`, `company.rotate_secret`

---

## 15. Implementation Order

1. DB schema — add all tables to `schemas.ts`, run `bun run db:generate && bun run db:push`
2. Domain models — add interfaces and enums to `domain-models.ts`
3. Repositories — register all new repos in `persistence-repositories.ts`
4. Input schemas — `job.input.ts`, `company.input.ts`
5. Company actions — `company.actions.ts` (create, update, member management, join code)
6. Job actions — `job.actions.ts` (CRUD, publish, close)
7. Public job board — `/jobs` + `JobCard` component
8. Job detail page — `/jobs/[handle]` with caching and comments
9. Company public page — `/companies/[handle]`
10. Dashboard: job management — list, create, edit pages
11. Dashboard: company management — profile, members, settings pages
12. Search — `job.service.ts` sync + MeilSearch index setup
13. Sitemaps — jobs + companies
14. i18n — Bengali keys

---

## 16. Out of Scope (V1)

| Feature                               | Reason                                                              |
| ------------------------------------- | ------------------------------------------------------------------- |
| In-platform job applications          | Significant complexity — external apply link validates demand first |
| Application tracking dashboard        | Depends on in-platform applications                                 |
| Internal conversation on applications | Depends on in-platform applications                                 |
| Resume upload                         | File handling + privacy considerations                              |
| Email alerts for new jobs             | Nice-to-have                                                        |
| Verified company badge                | Manual process — add later                                          |
| Paid featured listings                | After product-market fit                                            |
| Company followers                     | After product-market fit                                            |

---

## 17. Open Questions

1. **Who can post a job?** Any logged-in user (no company required), or must they belong to a company?
2. **Moderation:** Do new jobs go live immediately, or does the TechDiary team review first?
3. **Default expiry:** 30 days? 60 days? Should the Owner be reminded before expiry?
4. **Salary:** Required or optional? Many companies prefer not to disclose.
5. **Apply method:** Must the poster provide a URL or email, or is a listing with no apply path allowed?
6. **Invite expiry:** Should pending invites expire after 7 days, or stay open indefinitely?
7. **Notifications on application:** All company members notified, or only the Owner?
8. **Can Managers edit a published job?** Current design: no — only Owner can change status.
9. **Member cap:** No limit on company members, or a soft cap?
