# Student Opportunity Platform

MERN starter for a student opportunity ecosystem with role-based portals,
opportunities, contests, resume tooling, and AI-ready endpoints.

## Structure

- `server` - Express and MongoDB API
- `client` - React web app

## Local setup

1. Copy `server/.env.example` to `server/.env`.
2. Set MongoDB, Redis, JWT secrets, and provider credentials you want enabled.
3. Install dependencies in `server` and `client`.
4. Run MongoDB and Redis directly or from `server/docker-compose.yml`.
5. Run the API with `npm run dev` from `server`.
6. Run the web app with `npm run dev` from `client`.

The backend keeps integrations config-gated. OpenAI, Judge0, Razorpay, email,
S3, Redis, and MongoDB use real providers when configured and return explicit
errors when a provider is unavailable.
