# BankGrid Pro - Transaction Intelligence Platform

A professional-grade banking transaction management system built with **Angular 21**, **AG-Grid Enterprise**, **NestJS**, and **MySQL**. Designed to handle 500,000+ transactions with server-side pagination, advanced filtering, multi-sort, and real-time aggregations.

## Architecture

```
┌─────────────────────────┐     ┌──────────────────────────┐     ┌─────────────┐
│   Angular 21 Frontend   │────▶│   NestJS Backend (API)   │────▶│   MySQL 8.0  │
│   AG-Grid Enterprise    │◀────│   TypeORM                │◀────│  500K+ rows  │
│   Port 4200             │     │   Port 3000              │     │  Port 3307   │
└─────────────────────────┘     └──────────────────────────┘     └─────────────┘
```

## Features

### Grid Capabilities
- **Server-Side Row Model** - Handles 500K+ records without browser memory issues
- **Advanced Column Filtering** - Text, Number, Date, and Set filters with multi-condition support
- **Fast Typeahead Filtering** - Debounced search (300ms) that refines as you type
- **Grouped Set Filters** - Bank accounts automatically grouped by bank name
- **Multi-Sort** - Hold Ctrl + click columns to sort by multiple fields
- **Pagination** - Configurable page size (50/100/200/500), auto-resets on filter/search

### Search
- **Quick Search** - Single search term across all text columns
- **Advanced Search** - Multi-condition search with operators (equals, between, greater than, less than, contains, starts with) on any column

### Aggregations
- **Bottom Panel** - Select Sum, Average, Max, or Min for Amount, Fee, Converted Amount, and Risk Score
- **Live Updates** - Aggregations recalculate when filters change

### UI/UX
- **Dark/Light Mode** - Toggle with persistent preference
- **Dashboard Stats** - Total volume, transaction count, avg amount, completion rate
- **Status & Type Breakdown** - Visual breakdown cards
- **CSV Export** - Export current view to CSV
- **Professional Design** - Inter font, consistent spacing, subtle animations

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for MySQL)

### 1. Start MySQL Database
```bash
docker compose up -d
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed      # Seeds 500K transactions (~3 minutes)
npm run start:dev # Starts on http://localhost:3000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
ng serve          # Starts on http://localhost:4200
```

### Environment Configuration
Backend environment variables (`.env`):
```
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=bank_grid
PORT=3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions/grid` | Server-side grid data with filtering/sorting/pagination |
| POST | `/api/transactions/aggregations` | Sum, Avg, Min, Max for numeric columns |
| POST | `/api/transactions/distinct-values` | Distinct values for set filters |
| GET | `/api/transactions/filter-values?column=` | Grouped filter values for dropdowns |
| GET | `/api/transactions/dashboard` | Dashboard statistics |

## Data Model

### Banks (20 major global banks)
JPMorgan Chase, HSBC, Deutsche Bank, BNP Paribas, UBS, Barclays, Citigroup, Standard Chartered, MUFG, ANZ, RBC, Santander, ING, Goldman Sachs, Morgan Stanley, Nomura, Credit Suisse, Bank of America, Wells Fargo, Société Générale

### Accounts (689 accounts)
Types: SAVINGS, CHECKING, BUSINESS, INVESTMENT, TRUST

### Transactions (500,000)
- **Types**: WIRE, ACH, SWIFT, SEPA, INTERNAL, CHECK, CARD, FX
- **Statuses**: COMPLETED (65%), PENDING (15%), ON_HOLD (7%), FAILED (5%), CANCELLED (5%), REVERSED (3%)
- **Date Range**: Jan 2023 - Mar 2026
- **Amount Range**: $100 to $11M
- **Currencies**: USD, EUR, GBP, JPY, CHF, AUD, CAD, SGD, HKD, SEK

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Angular | 21.2 |
| Grid | AG-Grid Enterprise | 35.1 |
| Backend | NestJS | 11.x |
| ORM | TypeORM | 0.3.x |
| Database | MySQL | 8.0 |
| Container | Docker Compose | 3.8 |
