import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AddExpensePage from "./pages/AddExpensePage";
import ExpenseHistoryPage from "./pages/ExpenseHistoryPage";
import BudgetSettingsPage from "./pages/BudgetSettingsPage";
import AIInsightsPage from "./pages/AIInsightsPage";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/add-expense" element={<AddExpensePage />} />
        <Route path="/expenses" element={<ExpenseHistoryPage />} />
        <Route path="/budget" element={<BudgetSettingsPage />} />
        <Route path="/insights" element={<AIInsightsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
