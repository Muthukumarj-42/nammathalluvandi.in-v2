# Namma Thalluvandi - V2

Namma Thalluvandi is a marketplace platform specifically designed for food cart owners and buyers. It allows users to list their carts for sale or rent, and helps buyers find the right cart based on their business needs and location. The platform's core differentiator is its distance-based routing logic for connecting buyers and sellers efficiently.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database / Backend**: Supabase
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **UI Components**: Radix UI (Primitives)

## Environment Variables
The following environment variables are required to run the project. Do not commit actual secret values.

- `NEXT_PUBLIC_SUPABASE_URL`: The URL of the Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous public key for Supabase client-side requests.
- `SUPABASE_SERVICE_ROLE_KEY`: The service role key for backend-only admin actions.
- `WHATSAPP_API_TOKEN`: Token for the WhatsApp Cloud API (used for notifications and routing).
- `WHATSAPP_PHONE_NUMBER_ID`: The specific sender ID for the WhatsApp Cloud API.

## Database Schema Overview
The database schema handles the core operations of the marketplace. Key tables include:
- `carts`: Stores all listed carts, their condition, price, type, and location.
- `users`: Information about buyers and sellers.
- `whatsapp_messages`: Log table for debugging WhatsApp communications (Note: contains sensitive PII, strictly restrict access).
*(Refer to the V2 Development Plan for complete schema details as they evolve).*

## Folder Structure
- `app/`: Next.js 14 App Router pages and API routes.
- `components/`: Reusable React components (UI elements, layout components like BottomNav).
- `lib/`: Utility functions, Supabase client initialization, and shared helpers.
- `public/`: Static assets (images, icons).

## Known Limitations / FUTURE Items
Certain features are intentionally deferred to future versions to prioritize core marketplace functionality. These include:
- Integrated payments (currently handled directly between buyer and seller).
- Vendor rating system.
*(Refer to the FUTURE section of the main dev plan for a comprehensive list).*
