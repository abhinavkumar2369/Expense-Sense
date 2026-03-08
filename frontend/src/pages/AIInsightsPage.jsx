import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { fetchInsights } from "../services/mlService";
import LoadingSpinner from "../components/LoadingSpinner";

const AIInsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchInsights();
        setInsights(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <DashboardLayout>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h2 className="font-heading text-xl mb-2">Predicted Next Month Spending</h2>
            <p className="text-3xl font-bold text-ink">${insights?.prediction?.nextMonthExpense?.toFixed(2) || "0.00"}</p>
            <p className="text-sm text-slate-600 mt-1">Behavior: {insights?.classification || "Unknown"}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h3 className="font-heading mb-3">Insights</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              {(insights?.insights || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h3 className="font-heading mb-3">Anomaly Detection</h3>
            <p className="text-slate-700">Detected unusual transactions: {insights?.anomaliesCount || 0}</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AIInsightsPage;
