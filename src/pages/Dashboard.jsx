import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

function Dashboard() {
  const [sentimentData, setSentimentData] = useState({});
  const [qualityData, setQualityData] = useState({});
  const [yearlyData, setYearlyData] = useState({});
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch pies (sentiment + quality)
  useEffect(() => {
    setLoading(true);
    setError(null);

    let sentimentUrl = `http://localhost:5000/sentiment`;
    let qualityUrl = `http://localhost:5000/quality`;
    if (year) {
      sentimentUrl += `?year=${year}`;
      qualityUrl += `?year=${year}`;
    }

    Promise.all([fetch(sentimentUrl), fetch(qualityUrl)])
      .then(async ([res1, res2]) => {
        if (!res1.ok || !res2.ok) throw new Error("HTTP error!");
        const d1 = await res1.json();
        const d2 = await res2.json();
        setSentimentData(d1);
        setQualityData(d2);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching pie data:", err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      });
  }, [year]);

  // Fetch stacked bar chart data
  useEffect(() => {
    fetch("http://localhost:5000/sentiment_yearly")
      .then((res) => res.json())
      .then((d) => setYearlyData(d))
      .catch((err) =>
        console.error("Error fetching yearly sentiment:", err)
      );
  }, []);

  // ✅ Sentiment Pie
  const sentiments = ["POSITIVE", "NEUTRAL", "NEGATIVE"];
  const sentimentColors = {
    POSITIVE: "#4caf50",
    NEUTRAL: "#ffeb3b",
    NEGATIVE: "#f44336",
  };

  const sentimentPie = {
    labels: sentiments,
    datasets: [
      {
        data: sentiments.map((s) => sentimentData[s] || 0),
        backgroundColor: sentiments.map((s) => sentimentColors[s]),
      },
    ],
  };

  // ✅ Quality Pie
  const qualities = ["High Quality", "Average Quality", "Low Quality"];
  const qualityColors = {
    "High Quality": "#4caf50",
    "Average Quality": "#ffeb3b",
    "Low Quality": "#f44336",
  };

  const qualityPie = {
    labels: qualities,
    datasets: [
      {
        data: qualities.map((q) => qualityData[q] || 0),
        backgroundColor: qualities.map((q) => qualityColors[q]),
      },
    ],
  };

  // ✅ Stacked Bar
  const barLabels = Object.keys(yearlyData);
  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: "Positive",
        data: barLabels.map((y) => yearlyData[y]?.POSITIVE || 0),
        backgroundColor: "#4caf50",
      },
      {
        label: "Neutral",
        data: barLabels.map((y) => yearlyData[y]?.NEUTRAL || 0),
        backgroundColor: "#ffeb3b",
      },
      {
        label: "Negative",
        data: barLabels.map((y) => yearlyData[y]?.NEGATIVE || 0),
        backgroundColor: "#f44336",
      },
    ],
  };

  // Chart options
  const pieOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        font: { weight: "bold" },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}\n${value}`;
        },
      },
      legend: { position: "bottom", labels: { color: "#fff" } },
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Year filter */}
      <div className="mb-6">
        <label className="mr-2 font-medium">Filter by Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="bg-white text-black border border-gray-300 px-2 py-1 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Years</option>
          <option value="2020">2020</option>
          <option value="2021">2021</option>
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment Pie */}
        <div className="bg-gray-900 p-4 rounded shadow">
          <h2 className="font-semibold mb-2 text-white">Sentiment Breakdown</h2>
          {loading ? (
            <p className="text-gray-400 italic">Loading chart...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Pie data={sentimentPie} options={pieOptions} plugins={[ChartDataLabels]} />
          )}
        </div>

        {/* Quality Pie */}
        <div className="bg-gray-900 p-4 rounded shadow">
          <h2 className="font-semibold mb-2 text-white">Quality Breakdown</h2>
          {loading ? (
            <p className="text-gray-400 italic">Loading chart...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Pie data={qualityPie} options={pieOptions} plugins={[ChartDataLabels]} />
          )}
        </div>

{/* Stacked Bar */}
<div className="bg-gray-900 p-4 rounded shadow md:col-span-2">
  <h2 className="font-semibold mb-2 text-white">Sentiment Trend by Year</h2>
  {Object.keys(yearlyData).length === 0 ? (
    <p className="text-gray-400 italic">Loading yearly sentiment...</p>
  ) : (
    <Bar
      data={barData}
      options={{
        responsive: true,
        plugins: { legend: { labels: { color: "white" } } },
        scales: {
          x: { stacked: true, ticks: { color: "white" } },
          y: { stacked: true, ticks: { color: "white" } },
        },
      }}
    />
  )}
</div>

      </div>
    </div>
  );
}

export default Dashboard;
