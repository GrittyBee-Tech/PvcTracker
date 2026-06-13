This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# PVc-Waka-

# PVc-Waka-

PVC WAKA
Voter Registration Web Platform

PRODUCT REQUIREMENTS DOCUMENT (PRD)
Version 1.0 | May 2026
ABENOL Foundation | Confidential

1. Product Overview
   1.1 Product Name
   PVC WAKA — Voter Registration Web Platform

1.2 Product Summary
PVC WAKA is a civic-tech web application designed to increase Permanent Voter Card (PVC) registration and collection rates across Nigeria. The platform serves three distinct user types — the general public (Normal Users), community mobilisers (Volunteers), and platform operators (Administrators) — and covers the full voter registration journey: from checking INEC registration status, to locating collection centres, to tracking community-level outreach across all 36 states and the FCT.

1.3 Problem Statement
Millions of eligible Nigerian voters remain unregistered or have uncollected PVCs due to lack of awareness, difficulty locating INEC centres, and fragmented grassroots mobilisation efforts. No single digital platform currently addresses all three gaps simultaneously with an identity-verified, trackable system.

1.4 Goals & Objectives
• Enable any Nigerian to check their PVC registration and collection status online
• Provide accurate, location-aware INEC centre discovery across all LGAs
• Empower community volunteers to register and track multiple users under their account
• Give administrators real-time visibility into outreach metrics across all 36 states and 774 LGAs
• Ensure identity integrity via NIN verification before any platform action is unlocked

1.5 Out of Scope (v1.0)
• INEC backend integration for real-time PVC application submission (advisory platform only)
• Multi-language support (Hausa, Yoruba, Igbo, Pidgin) — deferred to v2
• Mobile native apps (iOS/Android) — web-responsive only
• Payment processing of any kind

2. User Personas & Roles
2.1 Role Overview
Role
Who They Are
Core Goal
Normal User
Any Nigerian citizen seeking voter registration information or PVC status
Register on platform, verify NIN, track their own PVC status
Volunteer
A registered, admin-approved community mobiliser
Register multiple users, track outreach count, monitor their team's progress
Administrator
ABENOL Foundation / platform operator
Manage all users, approve volunteers, download state/LGA metrics, maintain data integrity

2.2 Normal User
• Can self-register with basic personal information
• Receives email link to set password and input NIN
• NIN undergoes a confirmation/verification process before access is granted
• While NIN is pending: can view the platform but cannot perform any actions
• Once NIN is confirmed: can add VIN, Registration Type, and PVC Collected status
• Can check their PVC registration status
• Can find the nearest INEC registration/collection centre
• Can update their profile and PVC collection status

2.3 Volunteer
All Normal User capabilities, PLUS:
• Can register multiple other users (not just themselves)
• Has a personal dashboard showing how many users they have registered
• Can track the NIN confirmation and PVC status of users they registered
• Must apply to become a volunteer — admin must approve the application before volunteer access is granted
• Can be restricted or deleted by an administrator

2.4 Administrator
Full platform control, including:
• View, restrict, and delete Normal User accounts
• View, restrict, delete, and approve Volunteer accounts
• Monitor registration and outreach metrics for all 36 states + FCT
• Drill down to LGA-level data across 774 LGAs
• Download all metrics as exportable reports (CSV/Excel)
• Manage INEC centre data (add, edit, remove centres)
• Access audit logs and platform activity reports

3. Registration, Authentication & Identity
3.1 Normal User Registration Flow
Stage 1 — Basic Sign-Up (Public Form):
• User visits the platform and clicks 'Register'
• Completes Stage 1 form: First Name, Last Name, Date of Birth, Gender, Phone Number, Email Address
• System sends a verification email containing a secure link to set their password
• User clicks the link, sets their password, and is prompted to enter their NIN
• System submits NIN for verification against the national identity backend
• User account is created in 'Pending NIN Verification' state

Stage 2 — NIN Verification:
• NIN verification runs in the background (automated or manual queue)
• While pending: user can log in and browse the platform but all action buttons are disabled; a banner displays 'Your NIN verification is in progress'
• On NIN Confirmed: user receives notification (email + SMS) and full access is unlocked
• On NIN Rejected: user receives notification with guidance to re-submit or contact support

Stage 3 — Enrichment (Post-NIN confirmation):
• User can now optionally add: VIN (Voter Identification Number), Registration Type, PVC Collected status (Yes/No/Pending)

KEY RULE
NIN is the unique identifier for every user on the platform. No two accounts may share the same NIN. Duplicate NIN submissions must be rejected at the point of entry.

3.2 Volunteer Upgrade Flow
• A confirmed Normal User applies to become a volunteer via their profile or a dedicated CTA
• Application enters an admin review queue
• Admin reviews and either approves or rejects the application
• On approval: user's role is elevated to Volunteer and they receive access to the volunteer dashboard
• On rejection: user is notified with optional reason

3.3 Authentication Methods
Method
Details
Email + Password
Standard login with email and password set during onboarding
Phone + OTP
User enters registered phone number; receives OTP via SMS; OTP valid for 5 minutes
Password Reset
Via email link (expires in 24 hours)
Session Management
Authenticated sessions with auto-expiry after configurable idle time

4. Feature Specifications
4.1 PVC Registration Status Check
• Any NIN-verified user can query their PVC registration status
• Status fields: Registration Type, Registration State, LGA, PVC Collection Status (Collected / Not Collected / Pending)
• User can self-update their 'PVC Collected' field; this is not auto-synced with INEC in v1
• Status is displayed clearly on the user's profile dashboard

4.2 INEC Centre Finder
• Displays a searchable, filterable list/map of INEC registration and collection centres
• User can search by State and LGA to find the nearest centre
• Each centre record shows: Centre Name, Address, State, LGA, Operating Hours, Centre Type
• Data source: INEC public API (if free and accessible) — fallback to manually maintained database
• Admin can add, edit, and deactivate centre records from the dashboard

4.3 Volunteer Registration & Tracking Dashboard
• Volunteer has a dedicated dashboard showing total users registered by them
• List view of all users they registered: name, NIN status, PVC status
• Can register a new user directly from their dashboard (same Stage 1 form, but attributed to the volunteer's account)
• Volunteer cannot edit another user's data once submitted — admin only
• Volunteer metrics: total registered, NIN confirmed count, PVC collected count

4.4 Admin Dashboard
4.4.1 User Management
• View all Normal Users with filters: State, LGA, NIN Status, PVC Status, Registration Date
• Actions per user: View Profile, Restrict Account, Delete Account
• Bulk actions: restrict or delete multiple accounts

4.4.2 Volunteer Management
• View all Volunteer applications (Pending / Approved / Rejected)
• Approve or reject applications with optional notes
• View active volunteers and their outreach metrics
• Actions per volunteer: View Profile, Restrict Account, Revoke Volunteer Status, Delete Account

4.4.3 Metrics & Analytics
• Top-line KPIs: Total Registered Users, NIN Confirmed %, PVC Collected %, Active Volunteers
• State-level breakdown across all 36 states + FCT
• LGA-level drill-down for all 774 LGAs
• Time-series charts: registrations per day/week/month
• Volunteer performance table: ranked by users registered
• All data downloadable as CSV or Excel export

4.4.4 Centre Management
• Add, edit, and deactivate INEC centre records
• Import centres via bulk CSV upload

KEY RULE
Non reudiation for Admins (i.e there must be a way to know a certain change was made by an admin). For example; 3 Admins named Kola,Jade and Paul, a volunteer was deleted and we want to know which of the 3 admins deleted the user, this shouldn’t be difficult to find out.

5. Notifications
5.1 Notification Channels
All notifications are sent simultaneously across all three channels:
• Email (transactional email service, e.g. SendGrid or Mailgun)
• SMS (Nigerian SMS gateway, e.g. Termii, Sendchamp, or Africa's Talking)
• In-app notification bell (real-time, visible on all pages when logged in)

5.2 Notification Triggers
Trigger Event
Recipient(s)
Stage 1 registration complete
User — email with password-set link
Password successfully set
User — confirmation across all channels
NIN submitted for verification
User — acknowledgement notification
NIN verification confirmed
User — full access unlocked notification
NIN verification rejected
User — rejection reason + next steps
Volunteer application submitted
User — confirmation; Admin — new application alert
Volunteer application approved
Volunteer — approval notification
Volunteer application rejected
User — rejection notification
Account restricted by admin
User — account restriction notice
Account deleted by admin
User — account deletion notice (if email available)
PVC status updated by user
User — update confirmation

6. Data Model & Geographic Scope
6.1 User Data Model
Field
Stage Collected
Notes
First Name
Stage 1
Required
Last Name
Stage 1
Required
Date of Birth
Stage 1
Required
Gender
Stage 1
Required
Phone Number
Stage 1
Required; used for OTP and SMS
Email Address
Stage 1
Required; used for auth link and email notifications
Password
Post-email link
Hashed; bcrypt or equivalent
NIN
Post-password set
Unique; verified before access unlocked
NIN Verification Status
System-assigned
Pending / Confirmed / Rejected
VIN
Stage 3 (optional)
Voter Identification Number
Registration Type
Stage 3 (optional)
e.g. New Registration, Transfer
PVC Collected
Stage 3 (optional)
Yes / No / Pending
State
Stage 3 (optional)
One of 36 states + FCT
LGA
Stage 3 (optional)
One of 774 LGAs
Role
System-assigned
user / volunteer / admin
Account Status
System-assigned
Active / Restricted / Deleted
Registered By
System-assigned
Self or Volunteer ID
Created At
System-assigned
Timestamp

6.2 Geographic Scope
• All 36 Nigerian states plus the Federal Capital Territory (FCT) are supported at launch
• All 774 LGAs are included in filters, analytics, and centre data
• State and LGA data is stored as structured reference tables, not free-text

7. Non-Functional Requirements
Requirement
Specification
Performance
Page load under 3 seconds on standard Nigerian 4G connection; API responses under 500ms
Availability
99.5% uptime target; scheduled maintenance during off-peak hours (2–4am WAT)
Scalability
Architecture must support up to 500,000 registered users in v1 without re-architecture
Security
HTTPS enforced on all routes; NIN data encrypted at rest; role-based access control (RBAC) on all API endpoints; brute-force protection on login
Data Privacy
NIN and personal data stored in compliance with Nigeria Data Protection Regulation (NDPR); no PII shared with third parties without explicit consent
Mobile Responsiveness
Fully responsive design; primary UX optimised for mobile (majority of Nigerian users access internet via smartphone)
Browser Support
Chrome, Firefox, Safari, Edge — latest 2 versions; Android WebView support
Accessibility
WCAG 2.1 AA compliance as baseline; high-contrast text; readable font sizes
Export
Admin CSV/Excel exports must handle up to 500,000 rows without timeout; use async job queue if needed
Language
English only in v1

8. Permissions Matrix
Feature / Action
Normal User
Volunteer
Admin
Register own account
✓
✓
✓
Login (email+pass / phone+OTP)
✓
✓
✓
View platform (NIN pending)
✓ (view only)
✓ (view only)
✓
Check own PVC status
✓ (NIN confirmed)
✓
✓
Update own PVC data (VIN, status)
✓ (NIN confirmed)
✓
✓
Find INEC centre
✓ (NIN confirmed)
✓
✓
Register other users
✗
✓
✓
View own outreach metrics
✗
✓
✓
Apply to become Volunteer
✓
N/A
N/A
Approve/Reject Volunteer applications
✗
✗
✓
Restrict user/volunteer accounts
✗
✗
✓
Delete user/volunteer accounts
✗
✗
✓
View all users (state/LGA filters)
✗
✗
✓
View all volunteers + performance
✗
✗
✓
View state + LGA analytics
✗
✗
✓
Download metrics (CSV/Excel)
✗
✗
✓
Manage INEC centre records
✗
✗
✓

9. Launch Timeline & Milestones
TARGET
89% feature-complete by end of May 2026. Full launch readiness by early-June 2026.

Milestone
Target Date / Notes
PRD finalised & signed off
Week 1 (May 2026)
UI/UX wireframes & design system
Week 1–2
Backend architecture & DB schema
Week 1–2
Auth system (email+pass, OTP, NIN flow)
Week 2–3
Normal User registration + NIN verification
Week 2–3
INEC centre finder (data integration/manual)
Week 3
Volunteer dashboard & registration flow
Week 3–4
Admin dashboard (user/volunteer management)
Week 3–4
Admin analytics & metrics (state/LGA)
Week 4
Notification system (email + SMS + in-app)
Week 4
CSV/Excel export for admin
Week 4
QA, UAT & bug fixes
Week 5
89% completion checkpoint
End of May 2026
Final polish, security audit, deployment
June 2026

10. Risks & Mitigations
Risk
Impact
Mitigation
INEC API unavailable or paid
Centre finder feature incomplete
Build manual database of INEC centres as fallback; scrape public INEC data where permissible
NIN verification API latency / unavailability
User onboarding bottleneck
Queue-based async verification; show clear 'pending' state; allow admin to manually confirm NINs
Low mobile data speeds
Slow load times, high drop-off
Performance budget enforcement; lazy loading; compress assets; offline-first caching for static data
Duplicate/fraudulent NIN submissions
Identity integrity compromised
Hard uniqueness constraint on NIN at DB level; reject duplicates at API layer with clear error messaging
SMS delivery failures (Nigerian network)
OTP and notification failures
Multi-gateway fallback (e.g. primary: Termii, fallback: Africa's Talking); email as secondary OTP channel
Timeline overrun due to team size
Missing May deadline
Prioritise MVP features; defer v2 items (multilingual, analytics depth); weekly PM review cadence
NDPR compliance gaps
Legal/regulatory exposure
Review data handling with legal counsel; include consent checkboxes; document data retention policy

11. Open Questions & Decisions Pending
Question
Owner / Notes
Which NIN verification API will be used? (NIMC direct, third-party like Youverify / Dojah, or manual?)
Tech Lead — must resolve in Week 1
Is INEC's centre data API free and accessible? If not, who owns manual data entry?
PM — confirm with INEC or source public dataset
What SMS gateway will be used? (Termii, Africa's Talking, Sendchamp?)
Tech Lead — evaluate cost per SMS vs reliability
Will admin roles have tiers? (e.g. super-admin vs state-level admin?)
PM — deferred to v2 unless stakeholder requires it
What is the NIN verification SLA? How long should 'pending' state last before escalation?
PM + Tech Lead — define in Week 1
Who seeds the initial admin account? How is admin account creation managed?
Tech Lead — define secure admin provisioning flow
Is there a public-facing landing/marketing page, or does the site go straight to login/register?
PM — design decision; recommended to have landing page

12. Glossary
    Term
    Definition
    PVC
    Permanent Voter Card — the official voter identification card issued by INEC
    NIN
    National Identification Number — Nigeria's unique national identity number issued by NIMC
    VIN
    Voter Identification Number — a unique identifier tied to a voter's registration record
    INEC
    Independent National Electoral Commission — Nigeria's electoral body
    NIMC
    National Identity Management Commission — the body that issues NINs
    NDPR
    Nigeria Data Protection Regulation — Nigeria's primary data privacy law
    LGA
    Local Government Area — Nigeria's third-tier administrative division (774 total)
    OTP
    One-Time Password — a time-limited code sent via SMS for authentication
    RBAC
    Role-Based Access Control — a security model restricting system access based on user role
    KPI
    Key Performance Indicator — a measurable metric used to evaluate platform performance
