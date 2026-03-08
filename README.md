# Expense Sense - AI Powered Expense Tracker

Expense Sense is a full stack web application for tracking personal expenses with machine learning powered insights and forecasting.

## Tech Stack

- Frontend: React.js, Tailwind CSS, Recharts
- Backend: Node.js, Express.js, JWT, bcrypt
- Database: MongoDB (Mongoose)
- ML Module: Python, Pandas, Scikit-learn, Matplotlib

## Project Structure

```text
expense-sense/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    server.js
  frontend/
    src/
      components/
      context/
      hooks/
      layouts/
      pages/
      services/
      App.jsx
  ml-model/
    data/
    models/
    output/
    train_model.py
    predict.py
  README.md
```

## Core Features

- User registration and login with JWT authentication
- Password hashing with bcrypt
- Protected routes for expenses, budgets, profile, and AI insights
- Expense CRUD operations with category, date filters, and text search
- Dashboard metrics:
  - Total monthly expense
  - Category-wise spend distribution
  - Weekly spending trend
- Budget tracking:
  - Monthly budget setup
  - Budget exceeded warning
  - Budget vs spent visualization
- AI module:
  - Spending behavior classification
  - Next month expense prediction (regression)
  - Unusual transaction detection (Isolation Forest)
  - Insight generation and savings suggestions

## Database Collections

### Users
- `_id`
- `name`
- `email`
- `password`
- `createdAt`

### Expenses
- `_id`
- `userId`
- `amount`
- `category` (`Food`, `Travel`, `Shopping`, `Bills`, `Healthcare`, `Others`)
- `description`
- `date`
- `createdAt`

### Budgets
- `_id`
- `userId`
- `monthlyBudget`

## Backend API Endpoints

Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user

### Profile (Protected)
- `GET /profile` - Get profile
- `PUT /profile` - Update profile

### Expenses (Protected)
- `POST /expenses` - Add expense
- `GET /expenses` - Get expenses (supports `search`, `category`, `startDate`, `endDate` query)
- `PUT /expenses/:id` - Edit expense
- `DELETE /expenses/:id` - Delete expense
- `GET /expenses/summary` - Dashboard summary metrics

### Budget (Protected)
- `GET /budgets` - Get budget status
- `POST /budgets` - Set or update monthly budget

### Machine Learning (Protected)
- `GET /ml/insights` - Get AI insights and next-month prediction

## Installation and Setup

## 1. Clone and Open

```bash
git clone https://github.com/abhinavkumar2369/Expense-Sense.git
cd Expense-Sense/expense-sense
```

## 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
```

Update `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_sense
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=7d
ML_PYTHON_BIN=python3
ML_PREDICT_SCRIPT=../ml-model/predict.py
FRONTEND_URL=http://localhost:5173
```

Start backend:

```bash
npm run dev
```

## 3. Frontend Setup

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## 4. ML Module Setup

```bash
cd ../ml-model
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train_model.py
```

This generates `ml-model/models/expense_models.joblib`.

## 5. Running Full Project

From `expense-sense/` root:

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
```

## AI/ML Notes

- `train_model.py` trains and stores a regression model and behavior clustering model.
- `predict.py` receives expense payload, predicts next month spending, classifies behavior, detects anomalies, and outputs JSON.
- Backend integrates with Python using `child_process.spawn`.

## Production Readiness Suggestions

- Add request validation (Joi or Zod)
- Add centralized logging (Winston + log shipping)
- Add rate limiting and helmet middleware
- Add email/SMS alerts for budget thresholds
- Add PDF export endpoint for monthly reports
- Add CI pipeline for lint/test/build checks

## License

Licensed under the project license in `LICENSE`.
