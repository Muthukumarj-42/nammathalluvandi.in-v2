# Developer Instructions

# **Namma Thalluvandi — Developer Instructions**

This is not the feature spec — see `V2 Development plan` and `V2 Admin Page Spec` for that. This doc is about HOW to build, not WHAT to build. Read once before starting.

---

## **1\. Code comments**

* Comment only where the *why* isn't obvious from the code itself. Don't comment every line — comment decisions, not syntax.  
* Specifically comment:  
  * Any place implementing the distance-based routing logic (Part 3 of the main dev plan) — this is the core differentiator of the platform, future developers must understand why it's distance-based and not zone-based  
  * The 30-minute escalation logic and wherever the cron/scheduled job lives  
  * Any WhatsApp API integration code — mark clearly which parts are inside a free service-conversation window vs. using a paid template, since this affects cost  
  * Any place where a `status` enum transitions happen (e.g. `pending_review` → `live`) — note what triggers the transition  
* Skip comments on: standard CRUD operations, obvious form handling, styling

---

## **2\. Repo documentation — required before V2 is considered "done"**

Create a `README.md` at the project root (or update if one exists) covering:

* **What this project is** — one paragraph, plain language, for someone joining the team with zero context  
* **Tech stack** — Next.js 14, Supabase, any other libraries used, with versions  
* **Environment variables required** — list every `.env` key needed (Supabase URL/keys, WhatsApp Cloud API credentials, etc.) with a one-line description of what each one is for. Do NOT put actual secret values in this file — just the variable names and what they're for.  
* **Database schema overview** — link to or summarize the tables from the main dev plan, since the actual schema may evolve slightly during build  
* **Folder/file structure** — brief explanation of where to find what (pages, API routes, components, utils)  
* **Known limitations / FUTURE items** — link back to the FUTURE section of the main dev plan so nobody "discovers" a missing feature and assumes it was forgotten

This README is for two audiences: a future developer who needs to pick up the codebase, and Muthu (non-technical-on-this-specific-stack) who needs to understand what exists at a glance.

---

## **3\. Repo visibility and access**

* Repository should be **private**, not public — this is a live business with real vendor and customer data flowing through it once launched.  
* Only collaborators with a real reason to be there get access (currently: Muthu, you). **Don't make it public for portfolio purposes** while it's handling real user data — a public portfolio version (with fake/sample data) can be a separate consideration later if wanted, but not this repo.

---

## **4\. Git workflow**

* Work happens on a new branch off `v2-git`, not directly on main/v2-git itself  
* Commit messages should describe *what changed and why* in plain language — not just "fix bugs" or "update code." Example: `Add distance calculation for CV routing` not `update.js`  
* Before merging back, do a quick walkthrough with Muthu so he understands what changed, even at a high level — he's the product owner and needs to track progress even without reading every line of code

---

## **5\. Data handling — important given the platform's nature**

* Real vendor data (names, phone numbers, locations) will be flowing through this system once the field trip listings start coming in. Treat all of this as real personal data, not test data, from day one:  
  * No hardcoded test phone numbers or names committed into the codebase  
  * Use Supabase's environment separation (dev/staging vs. production) if feasible, rather than testing against real data  
  * **Be careful with logs** — the `whatsapp_messages` log table is useful for debugging but contains real phone numbers and message content; don't expose this data anywhere outside the protected admin page

---

## **6\. When in doubt**

* If a feature isn't clearly specified in the main dev plan or admin page spec, don't guess and build it — ask Muthu first. Scope creep into FUTURE features (payments, ratings, etc.) wastes time better spent getting V2 solid.  
* If something in the spec seems technically wrong or there's a better way to implement it (e.g. a more efficient distance query, a better cron alternative for the 30-min escalation), flag it — the spec describes the intended behavior, not a mandate on implementation detail. The distance based routing principle itself is non-negotiable; how you implement it is your call.

# V2 Development Plan

# **Namma Thalluvandi — V2 Development Plan**

**Branch:** new branch off `v2-git` (per existing repo convention)  
 **Scope tags:** \[V2\] \= build now | \[FUTURE\] \= documented, not built yet

---

## **1\. Why this doc exists**

This is the full system logic for NTV — what data exists, how it flows, and what each screen needs to do. UI styling, colors, and visual polish are NOT covered here — that comes later from the design side. This doc is about making the platform *work correctly*, not look good yet.

Read this top to bottom once before writing any code. The database structure in Part 2 is the foundation everything else depends on — build that first.

---

## **2\. Database structure \[V2\]**

Five core tables. Build in this order because later tables reference earlier ones.

### **`users`**

Every person on the platform.

* `id`  
* `role` — enum: `cv` (cart vendor) / `bv` (business vendor/renter) / `admin`  
* `name`  
* `phone` (WhatsApp number, required)  
* `created_at`

### **`carts`**

Each cart listing, owned by a `cv` user.

* `id`  
* `owner_id` → references `users.id`  
* `type` — e.g. "With Store", "With Roof", "Ice Cream", "Tea Stall"  
* `condition` — e.g. "Used \- Very Good", "New"  
* `size`, `weight`, `stove_type` — text fields  
* `price_per_month`  
* `photos` — array of image URLs (2-5 images)  
* `description` — short text, "About this cart"  
* `latitude`, `longitude` — REQUIRED, captured at listing time (see Part 4\)  
* `status` — enum: `pending_review` → `live` → `rented` → `inactive`  
* `verified` — boolean, flips true only after admin manually checks  
* `created_at`

### **`bookings`**

Every Business vendor enquiry/request for a cart.

* `id`  
* `booking_code` — auto-generated unique string, format `NTV-00XX`  
* `cart_id` → references `carts.id`  
* `bv_id` → references `users.id`  
* `cv_id` → references `users.id` (the Cart vendor currently assigned to respond)  
* `bv_latitude`, `bv_longitude` — captured when Business vendor submits enquiry  
* `status` — enum: `sent` → `cv_responded_yes` / `cv_responded_no` → `confirmed` → `completed` → `disputed`  
* `assigned_at` — timestamp, used for the 30-min escalation timer  
* `escalation_count` — integer, how many times this booking has been re-routed to a different Cart vendor  
* `created_at`

### **`whatsapp_messages` (log table)**

Every automated message sent, for debugging and audit trail.

* `id`  
* `booking_id` → references `bookings.id`  
* `direction` — `outbound` / `inbound`  
* `recipient_phone`  
* `message_body`  
* `status` — `sent` / `delivered` / `failed`  
* `created_at`

### **`disputes` \[V2 — lightweight only\]**

* `id`  
* `booking_id` → references `bookings.id`  
* `reported_by` → references `users.id`  
* `description` — free text  
* `status` — `open` / `resolved`  
* `created_at`

### **FUTURE tables (do not build yet, just know they're coming)**

* `reviews` — two-way ratings tied to completed bookings  
* `payments` — for in-app payment gateway integration

---

## **3\. Core principle: distance-based routing, NOT fixed zones \[V2\]**

**This is the most important logic in the whole platform. Get this right first.**

There is no "zone table" with fixed district boundaries. Instead:

1. Every `cart` has a real `latitude`/`longitude` captured when the Cart vendor lists it.  
2. Every `booking` captures the Business vendor's `latitude`/`longitude` when they submit an enquiry.  
3. When a Business vendor enquiry comes in for a cart (or for "any cart near me" search), the system calculates the straight-line distance between the Business vendor's location and every live Cart vendor's cart location, using the **Haversine formula** (standard lat/long distance calculation — many open-source libraries exist for this in JS, no need to build from scratch).  
4. The system ranks all relevant live Cart vendors by distance, nearest first.  
5. The booking is assigned to the **nearest** Cart vendor. A WhatsApp message fires automatically (see Part 5).  
6. If that Cart vendor doesn't respond within 30 minutes (`assigned_at` \+ 30 min, check via a scheduled job/cron), the system auto-escalates: re-assigns the booking to the **next nearest** Cart vendor, increments `escalation_count`, sends a fresh WhatsApp message.  
7. This repeats until a Cart vendor responds YES, or the list of nearby Cart vendors is exhausted (in which case, notify admin manually).

**Why this matters:** This is fairer and more accurate than fixed zones. A Cart vendor 30km away should always be contacted before one 37km away, regardless of which "district" either of them is technically in. Don't build a zones table — build the distance calculation instead.

**38 districts note:** You don't need to pre-populate a districts table for this logic to work. Lat/long handles it automatically. Districts can be shown as a readable label on the UI later (reverse-geocoding), but the actual matching logic never depends on district names.

---

## **4\. Screen-by-screen flow (text wireframe, logic only — no UI/styling notes)**

### **Screen 1 — Home**

**Purpose:** Entry point, search/browse.

Elements and their function:

* Location input — captures user's current lat/long (or manual location entry if GPS denied). This is required before showing nearby carts.  
* Search bar — text search against `carts.type`, `carts.description`  
* "Browse by Type" — filter buttons mapped to `carts.type` values  
* "Premium Models" — carts where `verified = true`, sorted by some future trust score (for now: most recently verified first)  
* "Own a Food Cart? Start Selling" — CTA leading to Screen 4 (listing flow)

**Logic note:** Every cart shown on this screen must be `status = 'live'`. Never show `pending_review` or `inactive` carts here.

### **Screen 2 — Search/Catalog**

**Purpose:** Filtered list of carts, sorted by distance from user.

* Filter tabs — by `type`  
* Sort control — by price, or by distance (default: distance ascending)  
* Cart card shows: condition badge, type, distance from user (calculated live), price, "Contact"/"Request Booking" button  
* **Important fix from wireframe review:** the original design showed a direct phone/contact icon on these cards. Remove this. Tapping "Request Booking" must always go through the booking flow (Part 5), never a raw phone number.

### **Screen 3 — Cart Detail**

**Purpose:** Full cart info before requesting.

* Photos, condition badges, type, location (can show area name via reverse geocode, not exact pin), price/month, verified badge  
* Specs row: size, weight, stove type  
* "About this cart" description  
* Owner display: name \+ circular avatar — **this is correct, NTV always shows Cart vendor identity, unlike Suvai's hidden-vendor model. Do not confuse the two products' logic.**  
* **Critical fix:** Remove "Pay Now" button entirely for V2. Replace with "Request Booking" — this triggers the booking creation flow (Part 5), not a payment flow. Payment integration is FUTURE only.  
* Remove any direct Cart vendor phone number display here too — same reasoning as Screen 2\.

### **Screen 4 — Sell/List Your Cart**

**Purpose:** Cart vendor onboarding entry point.

* Static info: active buyer count, "Free to list", setup time estimate  
* 3-step explainer (Add Photos → Fill Details → Go Live)  
* **Critical copy fix:** original wireframe said "Buyers contact you directly to WhatsApp. No middleman." This must be changed. The actual flow is the opposite — NTV mediates every contact via the booking-ID system. Suggested replacement logic to communicate: "Buyers reach you through NTV-verified requests, safely and simply." Get final copy from Muthu before shipping, but the underlying behavior (NTV mediates, always) is non-negotiable for the trust model to work.  
* "Start Selling" button leads to Screen 5 (the actual form)

### **Screen 5 — Quick Listing Form**

**Purpose:** Cart vendor submits a new cart.

Fields, in order:

* Cart Type — dropdown (matches `carts.type` enum)  
* Condition — dropdown  
* Asking Price (₹/month)  
* **Location — REQUIRED.** Must capture actual lat/long via map pin or device GPS, not just a text address. This field did not exist in the original wireframe's submission logic clearly enough — it is the single most important field for the routing system in Part 3 to function. Do not let this be optional or skippable.  
* Cart Photos — 2-5 images, upload to Supabase storage  
* Submit button

**On submit:** Create a `carts` row with `status = 'pending_review'`, `verified = false`. Do NOT make it live automatically.

### **Screen 6 — Admin approval (new, not in original wireframe)**

**Purpose:** Muthu (admin) reviews new listings before they go live.

Minimal version for V2: a simple list of `pending_review` carts, with cart details visible, and an Approve/Reject action. Approve sets `status = 'live'`. This can be as simple as a protected admin page — does not need polish.

**Why this exists:** Protects the "NTV verified" trust promise discussed earlier. Listings should not appear publicly until checked, especially while vendor density is still low and every bad listing damages trust disproportionately.

---

## **5\. WhatsApp automation flow \[V2\]**

**Setup prerequisite (Muthu is handling):** New SIM, Meta Business account, WhatsApp Cloud API access. Roommate's code should assume API credentials will be provided as environment variables once that's ready — build the integration layer now, test with a sandbox/test number if Meta API isn't live yet.

**Flow logic:**

1. Business vendor submits an enquiry (either from Screen 2/3 "Request Booking", or a general "find me a cart" request) → a `bookings` row is created with `status = 'sent'`, assigned to the nearest live Cart vendor per Part 3 logic.

2. The system sends an automated WhatsApp message to that Cart vendor's phone number via the Cloud API. Messages must include the `booking_code` (e.g. `NTV-0042`), the Business vendor's name, and a way to reply (e.g. "Reply YES or NO").

3. This message should be sent as a **service/utility-style message within a customer-initiated window where possible** to stay in WhatsApp's free tier — meaning, structure it so the Cart vendor or Business vendor has messaged first wherever possible (e.g. Cart vendor opted in to notifications, or replies trigger the next message). If sending a cold business-initiated message is unavoidable for the very first contact, it will need a pre-approved message template from Meta — factor this into setup time.

4. Cart vendor replies YES or NO (this is an inbound message, free to receive).

   * If YES → `bookings.status = 'cv_responded_yes'`, the system sends Business vendor an automated confirmation message with Cart vendor's contact info now released for direct coordination, and the booking ID for reference.  
   * If the NO → system immediately re-routes to the next nearest Cart vendor (same logic as the 30-min timeout below), without waiting for the timer.  
5. **Escalation logic:** if no reply at all within 30 minutes of `assigned_at`, a scheduled job checks for stale `sent` bookings, re-assigns to the next nearest Cart vendor (`escalation_count += 1`), and fires a fresh message. This needs a cron job or Supabase scheduled function — confirm what's available in your Supabase plan.

6. Every message sent/received gets logged in `whatsapp_messages` for debugging and so Muthu can manually trace any booking if something goes wrong.

**Do not build:** marketing broadcast messages, bulk messaging, or anything beyond this transactional booking flow. Keep V2 scope to exactly this loop.

---

## **6\. Dispute reporting \[V2 — lightweight\]**

* A "Report an issue" action available on `completed` or `confirmed` bookings, accessible to both Business vendor and Cart vendor.  
* Creates a row in `disputes` with the booking reference and free-text description.  
* No automated resolution logic — this just creates a record and should notify admin (Muthu) somehow, even if that's just a query he checks manually for now, or a simple email/notification trigger.

---

## **7\. FUTURE features (documented only, do not build in V2)**

* **Two-way ratings/reviews** — Cart vendor rates Business vendor, Business vendor rates Cart vendor, tied to completed bookings. Feeds into a future "Trusted Vendor" tier.  
* **In-app payments** — real "Pay Now" flow, requires payment gateway (Razorpay or similar), deposit holding, payout scheduling. Significant compliance lift, intentionally deferred.  
* **Cart vendor loyalty/trust tiers** — surfacing best-performing Cart vendors higher in search/listings based on completed bookings \+ ratings, once that data exists.  
* **Reverse-geocoded area labels** — showing readable area/district names instead of raw coordinates in the UI, as a display layer on top of the lat/long system already in place.  
* **Suvai integration bridge** — once a Business vendor successfully starts their business via a rented cart, prompt them to onboard onto the Suvai platform for discovery, FSSAI guidance, and Google Business setup. Cross-platform funnel, separate codebase/product.  
* **Automated dispute resolution** — structured refund/resolution flows, once enough real dispute cases from V2's lightweight version reveal actual patterns worth automating.  
* **Full persistent language toggle** — Tamil/English switch applied consistently across every screen and saved as a user preference, not just translated landing copy.

---

## **8\. Build order recommendation for roommate**

1. Database tables (Part 2\) — get this right first, everything depends on it  
2. Distance calculation utility (Part 3\) — write and test this in isolation before wiring it into any screen  
3. Listing flow: Screen 5 form → Screen 6 admin approval → cart goes live  
4. Browse/search flow: Screen 1 → Screen 2 → Screen 3, all reading from `carts` where `status = 'live'`  
5. Booking flow: "Request Booking" action → creates `bookings` row → triggers distance-based Cart vendor assignment  
6. WhatsApp integration (Part 5\) — build last, since it depends on the booking flow existing first, and depends on Muthu's Meta Business account being ready  
7. Dispute reporting (Part 6\) — quick add-on once bookings flow works

---

## **9\. Open items Muthu still needs to provide**

* Meta Business account \+ WhatsApp Cloud API credentials (in progress, new SIM being purchased)  
* Final approved copy for Screen 4 (the "no middleman" line must change — exact replacement wording pending)  
* Admin notification preference for disputes (email? WhatsApp? a dashboard he checks manually?)  
* Supabase plan confirmation — whether scheduled/cron functions are available for the 30-min escalation timer, or if an alternative (e.g. a Vercel cron job calling an API route) is needed instead

# V2 Admin Page Spec

# **Namma Thalluvandi — V2 Admin Page Spec**

**Scope:** \[V2\] — build alongside the main platform, not deferred **Note:** This document covers ONLY the admin page. Refer to the main `V2 Development Plan` for the full database structure and core platform flow. This page is purely a control center for Muthu — no public access, no UI styling decisions made here.

---

## **1\. Purpose**

A single protected page where Muthu (admin) manages the trust and operations layer of the platform — approving listings, watching booking health, handling disputes, and tracking Cart vendor relationships. This is not a customer-facing screen.

---

## **2\. Access control**

* Route is protected — only accessible to a user with `role = 'admin'` in the `users` table.  
* No public link anywhere in the site navigation. Direct URL \+ login/session check only.  
* Keep this simple for now: a single hardcoded admin check tied to Muthu's account. Do NOT build multi-admin permissions, role hierarchies, or granular access control yet — there is only one admin for the foreseeable future. Over-building this wastes dev time.

---

## **3\. Section 1 — Pending approvals**

**Purpose:** Daily checkpoint for new cart listings before they go live.

* Lists every cart where `status = 'pending_review'`  
* Each entry shows full listing details: photos, type, condition, price, location (lat/long, shown as a map pin or readable coordinates), owner name/contact, description  
* Two actions per listing:  
  * **Approve** → sets `status = 'live'`  
  * **Reject** → sets `status = 'inactive'` (or a separate `rejected` status if you want to distinguish "rejected at review" from "deactivated later")  
* This is the most frequently used section, especially right after the field trip when listings start coming in. Should be the default/landing view of the admin page.

---

## **4\. Section 2 — Live carts directory**

**Purpose:** Full visibility and control over everything currently public.

* Searchable/filterable list of every cart where `status = 'live'`  
* Ability to edit listing details directly (in case of errors found post approval)  
* Ability to deactivate a listing (sets `status = 'inactive'`) — needed when a Cart vendor asks to pause their listing, or an issue is discovered after it went live

---

## **5\. Section 3 — Bookings monitor**

**Purpose:** Catch system failures before they become a lost Business vendor or a Cart vendor who stops trusting the platform.

* List of all bookings with current `status`, sortable/filterable by status  
* **Flag stuck bookings explicitly:**  
  * Any booking in `sent` status where `assigned_at` is older than 30 minutes and hasn't escalated yet (signals the cron/scheduled job may have failed)  
  * Any booking with a high `escalation_count` (e.g. 3+) — means multiple Cart vendors in that area aren't responding, worth a manual check or phone call  
* This section is your early-warning system for both technical failures (escalation not firing) and relationship failures (Cart vendors going quiet)

---

## **6\. Section 4 — Disputes queue**

**Purpose:** Central place to act on reported issues.

* Lists all entries from the `disputes` table where `status = 'open'`  
* Each entry links to the relevant `booking_id` so full context is visible — cart, Business vendor, Cart vendor, and what was reported  
* Action to mark a dispute `resolved` once handled manually (no automated resolution logic in V2 — this is just a structured record \+ action point)

---

## **7\. Section 5 — Cart vendor directory**

**Purpose:** Relationship management view — who's reliable, who needs a follow-up call.

* List of all users where `role = 'cv'`  
* For each Cart vendor, show:  
  * Number of listings (and how many are currently `live`)  
  * Response rate — how often they reply within the 30-min window vs. get escalated past  
  * Contact info (phone number)  
* This becomes the practical tool for deciding who to call when a Cart vendor goes quiet, or who to prioritize for the next field visit

---

## **8\. Section 6 — WhatsApp message log viewer**

**Purpose:** Debugging and trust verification when something goes wrong.

* Read-only view into the `whatsapp_messages` table  
* Filterable by `booking_id` or phone number  
* Shows direction (inbound/outbound), message body, delivery status, timestamp  
* Use case: a Business vendor or Cart vendor claims "I never got a message" — this lets Muthu check exactly what was sent and whether it actually delivered, instead of guessing or assuming the worst about the system

---

## **9\. Build priority within this page**

If building incrementally, this is the order of importance:

1. **Pending approvals** — nothing else matters if listings can't be reviewed  
2. **Bookings monitor** — critical once the WhatsApp automation is live, to catch silent failures  
3. **Cart vendor directory** — becomes useful as soon as more than a handful of Cart vendors are onboarded  
4. **Live carts directory** — needed but lower urgency than the above three  
5. **Disputes queue** — build once bookings are flowing and real disputes start appearing  
6. **WhatsApp message log** — debugging tool, useful from day one of automation but not blocking for other sections to function

---

## **10\. What NOT to build yet**

* No analytics/charts/graphs — raw lists with filters are enough for now  
* No multi-admin roles or permission levels  
* No automated dispute resolution — manual action only  
* No notification system beyond what's already planned (admin checks this page directly; a separate alert/email system is a future addition, not V2)

