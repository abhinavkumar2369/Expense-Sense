<div align="center">

# 💰 Expense Sense

### AI-Powered Smart Expense & Fraud Detection System

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js_14-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Track expenses · Detect fraud · Predict spending · Gain AI insights**

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [ML Models](#-ml-models)
- [Security](#-security)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- **Expense CRUD** — Create, read, update, and delete transactions
- **AI Auto-Categorisation** — TF-IDF + Naive Bayes classifies expenses automatically
- **Fraud Detection** — Isolation Forest flags anomalous transactions in real-time
- **Spending Prediction** — Linear Regression predicts next month's spending
- **Interactive Analytics** — Category pie charts and monthly trend line charts
- **Activity Logging** — Full audit trail of all user actions

### Security Features
- **JWT Authentication** — Stateless token-based auth with role-based access control
- **bcrypt Password Hashing** — Industry-standard password protection
- **AES-256-GCM Encryption** — Sensitive financial notes encrypted at rest
- **Rate Limiting** — Sliding-window rate limiter on login endpoint
- **Role-Based Access** — User and Admin roles with protected routes

### Dashboard Pages
| Page | Description |
|------|-------------|
| **Overview** | Monthly summary, stat cards, charts, AI prediction |
| **Transactions** | Full CRUD table with filters, pagination, modal forms |
| **Analytics** | Category breakdown, monthly trend, prediction widget |
| **Fraud Alerts** | Flagged transactions with fraud scores |
| **Activity Log** | User action history |
| **Settings** | Profile management, password change |
| **Admin: Users** | User management (admin only) |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance async web framework |
| **Python 3.11+** | Modern Python with type hints |
| **MongoDB** | Document database (via Motor async driver) |
| **Pydantic v2** | Data validation and serialisation |
| **PyJWT** | JWT token creation and verification |
| **bcrypt** | Password hashing |
| **cryptography** | AES-256-GCM encryption |
| **scikit-learn** | ML models (NB, LR, Isolation Forest) |
| **Joblib** | Model serialisation |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS |
| **Recharts** | Data visualisation (charts) |
| **Axios** | HTTP client with interceptors |
| **Lucide React** | Modern icon library |
| **react-hot-toast** | Toast notifications |

---

## 🏗 Architecture

```
┌─────────────────┐     HTTP/JSON      ┌─────────────────────┐
│   Next.js 14    │ ◄────────────────► │    FastAPI Server    │
│   (Frontend)    │                     │    (Backend API)     │
│                 │                     │                      │
│  • App Router   │                     │  • JWT Auth          │
│  • Tailwind     │                     │  • Rate Limiting     │
│  • Recharts     │                     │  • AES Encryption    │
│  • Auth Context │                     │  • ML Pipeline       │
└─────────────────┘                     └──────────┬──────────┘
                                                   │
                                          ┌────────┴────────┐
                                          │    MongoDB       │
                                          │  (Motor Async)   │
                                          │                  │
                                          │  • Users         │
                                          │  • Transactions  │
                                          │  • Activity Logs │
                                          └─────────────────┘
```

---

## 📂 Project Structure

```
Expense-Sense/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py              # Auth dependencies (get_current_user)
│   │   │   └── routes/
│   │   │       ├── auth.py          # Register, Login, Me
│   │   │       ├── transactions.py  # CRUD + ML integration
│   │   │       ├── analytics.py     # Summary + Prediction
│   │   │       ├── admin.py         # Admin-only routes
│   │   │       └── activity_logs.py # User activity logs
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic Settings
│   │   │   ├── database.py          # Motor async client
│   │   │   └── security.py          # JWT, bcrypt, AES
│   │   ├── middleware/
│   │   │   ├── error_handler.py     # Global exception handlers
│   │   │   └── rate_limiter.py      # Login rate limiting
│   │   ├── ml/
│   │   │   ├── train.py             # Model training script
│   │   │   ├── predictor.py         # Prediction functions
│   │   │   └── models/              # Saved .joblib files
│   │   ├── models/
│   │   │   └── indexes.py           # MongoDB index setup
│   │   ├── schemas/
│   │   │   ├── user.py              # User Pydantic models
│   │   │   ├── transaction.py       # Transaction models
│   │   │   ├── activity_log.py      # Activity log models
│   │   │   └── response.py          # API response wrapper
│   │   ├── services/
│   │   │   └── activity_logger.py   # Activity logging service
│   │   └── main.py                  # FastAPI entry point
│   ├── scripts/
│   │   └── seed.py                  # Database seeding script
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout with AuthProvider
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── globals.css
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx       # Dashboard shell with sidebar
│   │   │       ├── page.tsx         # Overview
│   │   │       ├── transactions/page.tsx
│   │   │       ├── analytics/page.tsx
│   │   │       ├── fraud-alerts/page.tsx
│   │   │       ├── activity/page.tsx
│   │   │       ├── settings/page.tsx
│   │   │       └── admin/users/page.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── DashboardShell.tsx
│   │   │   ├── ui/
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   └── charts/
│   │   │       ├── CategoryPieChart.tsx
│   │   │       └── MonthlyLineChart.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── lib/
│   │   │   ├── api.ts               # Axios instance
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── middleware.ts             # Next.js route protection
│   ├── Dockerfile
│   ├── .env.example
│   └── .env.local
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the Repository

```bash
git clone https://github.com/abhinavkumar2369/Expense-Sense.git
cd Expense-Sense
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.

# Train ML models
python -m app.ml.train

# Seed database (optional – creates sample data)
python -m scripts.seed

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at: **http://localhost:8000**
Interactive docs at: **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Ensure NEXT_PUBLIC_API_URL points to your backend

# Start development server
npm run dev
```

The app will be available at: **http://localhost:3000**

### 4. Docker Compose (Alternative)

```bash
# From project root
docker-compose up --build
```

This starts MongoDB, the backend API, and the frontend in containers.

---

## 📡 API Documentation

The backend exposes a full REST API. Visit `/docs` for interactive Swagger UI.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login (returns JWT) |
| GET | `/api/v1/auth/me` | Get current user |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/transactions/` | Create transaction |
| GET | `/api/v1/transactions/` | List transactions (paginated) |
| GET | `/api/v1/transactions/{id}` | Get single transaction |
| PUT | `/api/v1/transactions/{id}` | Update transaction |
| DELETE | `/api/v1/transactions/{id}` | Delete transaction |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/summary` | Spending summary & trends |
| GET | `/api/v1/analytics/predict` | AI spending prediction |

### Admin (requires admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List all users |
| PATCH | `/api/v1/admin/users/{id}/role` | Change user role |
| GET | `/api/v1/admin/flagged` | All flagged transactions |
| GET | `/api/v1/admin/activity-logs` | All activity logs |

---

## 🤖 ML Models

### 1. Expense Categorisation (TF-IDF + Multinomial Naive Bayes)

- Vectorises transaction descriptions using TF-IDF with bigrams
- Classifies into 10 categories: Food, Transport, Entertainment, Utilities, Healthcare, Shopping, Housing, Education, Income, Uncategorised
- Auto-triggers when no category is provided during transaction creation

### 2. Spending Prediction (Linear Regression)

- Trains on user's monthly spending history
- Predicts next month's total expenditure
- Returns R² confidence score

### 3. Fraud Detection (Isolation Forest)

- Features: transaction amount, description length, hour of day
- Trained with 4% contamination rate
- Outputs anomaly score normalized to [0, 1]
- Transactions with score > 0.65 are automatically flagged
- Additional heuristic boosts for large amounts, short descriptions, late-night activity

### Training

```bash
cd backend
python -m app.ml.train
```

Models are saved as `.joblib` files in `backend/app/ml/models/` and loaded at server startup.

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| **Authentication** | JWT tokens (PyJWT) with configurable expiry |
| **Password Hashing** | bcrypt with auto-generated salt |
| **Encryption** | AES-256-GCM for sensitive note fields |
| **Rate Limiting** | Sliding window (5 attempts / 5 minutes) on login |
| **Role-Based Access** | User and Admin roles, enforced via FastAPI dependencies |
| **Activity Logging** | All CRUD operations and auth events are logged |
| **CORS** | Strict origin allowlist |
| **Input Validation** | Pydantic v2 models on all endpoints |

---

## 🌐 Deployment

### Frontend → Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Set root directory to `frontend`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   ```
5. Deploy

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set root directory to `backend`
4. Build command: `pip install -r requirements.txt && python -m app.ml.train`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables from `.env.example`

### Database → MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP (or `0.0.0.0/0` for Render)
3. Get the connection string and set it as `MONGODB_URI`

---

## 🖼 Screenshots

> Launch the application and explore:
>
> - **Landing Page** — Beautiful hero with feature cards
> - **Dashboard** — Stat cards, charts, AI prediction banner
> - **Transactions** — CRUD table with modals and filters
> - **Analytics** — Pie chart, line chart, category breakdown table
> - **Fraud Alerts** — Flagged transactions with severity scores
> - **Activity Log** — Colour-coded audit trail
> - **Settings** — Profile and password management

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Abhinav Kumar](https://github.com/abhinavkumar2369)**

</div>
