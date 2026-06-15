# Mosaic Talent Network — Product Requirements Document

## Overview

The Mosaic Talent Network is a centralized, searchable talent database for Northeastern University's Mosaic entrepreneurial ecosystem — a collection of 15+ student-led organizations including Generate, IDEA, Scout, HuskyVC, TAMID, Forge, OASIS, and others. It allows anyone to discover students and alumni across these organizations by skills, interests, roles, and graduation year, and gives admins tools to manage the directory.

## Problem Statement

Mosaic's ecosystem spans thousands of students across many organizations that operate independently. There was no unified way to find collaborators, identify talent, or understand who is doing what across the ecosystem. Students seeking co-founders, mentors, or team members had no central resource.

## Users

| User Type | Description | Access |
|---|---|---|
| Public visitor | Any person with the URL | Read-only search and browse |
| Admin | Approved email addresses only | Full CRUD on profiles, CSV import |

There is no student self-registration in v1. All profiles are loaded by admins.

## Core Features

### Search & Discovery (Public)
- Full-text search across name, bio, major, skills, interests, organizations
- Filter sidebar: organization, role, skill, interest, graduation year
- Paginated results (20 per page)
- Profile cards showing name, orgs, skills, graduation year, bio, LinkedIn

### Admin Panel (Authenticated Admins Only)
- **Upload CSV/Excel** — bulk import with dedup, AI enrichment, and result summary
- **Add Manually** — single-profile form with all fields
- **Manage Profiles** — paginated searchable table with Edit (modal) and Delete per row

### Homepage
- Hero search bar routing to /search
- Stats (500+ members, 50+ orgs, 100+ skills)
- "Connect with Our Mosaic Community" section (UI built, backend TBD) — students enter their email to find top 3 profile matches

## Data Model

Each profile contains:

| Field | Type | Notes |
|---|---|---|
| full_name | text | Required |
| email | text | Unique where not null |
| graduation_year | int | 1950–2040 |
| college | text | |
| major | text | |
| location | text | |
| organizations | text[] | Array |
| roles | text[] | Array |
| skills | text[] | Array |
| interests | text[] | Array |
| linkedin_url | text | |
| website_url | text | |
| bio | text | |
| is_active | boolean | Soft-delete flag |

## Scope Boundaries (v1)

**In scope:**
- Admin-managed profiles only
- Public read-only search
- CSV/Excel bulk import
- Manual add/edit/delete
- AI-assisted data normalization on import

**Out of scope (v1):**
- Student self-registration or profile claiming
- Messaging or connection requests
- Email notifications
- Profile photos
- Connect/match feature backend (UI placeholder only)
- Analytics dashboard

## Success Metrics

- Admins can import 2,000+ profiles in under 5 minutes
- Search returns results in under 1 second
- Zero unauthenticated writes to the database
