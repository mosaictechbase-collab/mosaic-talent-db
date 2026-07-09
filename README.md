# Mosaic Talent Network

A full-stack talent management platform built for Northeastern University's Mosaic entrepreneurship ecosystem.

The Mosaic Talent Network centralizes member information across entrepreneurship organizations into a single searchable platform. Designed for administrators, it streamlines talent discovery, onboarding, and organization management through AI-assisted profile enrichment, bulk data imports, and an intuitive dashboard.

---

## Highlights

- Full-stack web application built with **Next.js**, **React**, **TypeScript**, and **Supabase**
- AI-powered profile enrichment using **Anthropic Claude**
- Bulk CSV import pipeline with validation and deduplication
- Secure administrator authentication
- Searchable database supporting thousands of member records
- Built for the Northeastern entrepreneurship ecosystem
- Production-ready architecture deployed with modern cloud tooling

---

# Why This Project Exists

The Northeastern entrepreneurship ecosystem consists of numerous organizations, each maintaining its own member data. This made it difficult to identify talent, collaborate across organizations, and maintain accurate records.

The Mosaic Talent Network solves this by providing a centralized platform where administrators can upload, manage, search, and enrich member profiles through a single interface.

---

# Features

## Talent Management

- Centralized member database
- Organization-specific profiles
- Search and filtering
- Profile management

## AI Enrichment

- Claude-powered profile enrichment
- Intelligent data extraction
- Rule-based fallback system
- Automatic profile completion

## CSV Processing

- Bulk CSV upload
- Validation pipeline
- Duplicate detection
- Data normalization

## Authentication

- Secure administrator login
- Protected admin routes
- Session management

## Dashboard

- Responsive interface
- Fast filtering
- Pagination
- Administrative workflows

---

# Tech Stack

## Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS

## Backend

- Supabase
- PostgreSQL
- Server Actions

## Authentication

- Supabase Auth

## AI

- Anthropic Claude API

## Deployment

- Vercel

---

# Architecture

```
                    CSV Upload
                         │
                         ▼
              Validation & Parsing
                         │
                         ▼
                 Data Normalization
                         │
                         ▼
                Supabase PostgreSQL
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
   AI Profile Enrichment        Search & Filtering
          │                             │
          └──────────────┬──────────────┘
                         ▼
               Administrator Dashboard
```

---



# Engineering Challenges

## Scalable CSV Processing

Designed a pipeline capable of importing large datasets while validating records, handling malformed data, and preventing duplicate entries.

---

## AI Profile Enrichment

Integrated Anthropic Claude to automatically enrich profile information while implementing deterministic fallback logic to ensure reliability when AI responses fail.

---

## Authentication & Authorization

Implemented secure administrator-only authentication using Supabase with protected server-side routes.

---

## Search Performance

Built efficient filtering and search functionality capable of handling thousands of records while maintaining responsive performance.

---

## Data Consistency

Designed normalization and validation logic to maintain consistent data quality across uploads from multiple organizations.

---

# Development

## Clone

```bash
git clone https://github.com/<organization>/mosaic-talent-database.git
```

## Install

```bash
npm install
```

## Environment Variables

Copy the example environment file.

```bash
cp .env.local.example .env.local
```

Populate the required environment variables.

---

## Run

```bash
npm run dev
```

---

# Environment Variables

Required variables are documented in:

```
.env.local.example
```

Sensitive credentials should **never** be committed to the repository.

---

# Future Improvements

- Semantic search
- Role-based permissions
- Analytics dashboard
- Organization reporting
- Automated duplicate resolution
- Better AI recommendations
- Real-time synchronization
- Mobile responsiveness improvements

---

# Lessons Learned

Building this project reinforced several engineering principles:

- Designing software around real stakeholder requirements
- Building maintainable full-stack applications
- Integrating LLMs into production workflows
- Developing reliable fallback systems for AI-powered features
- Structuring scalable PostgreSQL schemas
- Balancing developer experience with production reliability

---

# Repository

This repository contains the source code for the Mosaic Talent Network platform.

For security reasons, deployment credentials and production environment variables are excluded from version control.

---

# Author

**Asmita [Last Name]**

Electrical Engineering @ Northeastern University

### Interests

- Full-Stack Engineering
- Artificial Intelligence
- Systems Design
- Developer Tools
- Startup Engineering

LinkedIn: *(add link)*

GitHub: *(add link)*
