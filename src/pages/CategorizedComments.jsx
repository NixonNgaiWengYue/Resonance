import React, { useEffect, useState } from "react";

function CategorizedComments() {
  const [categories, setCategories] = useState([]); // list of categories
  const [selectedCategory, setSelectedCategory] = useState("");
  const [data, setData] = useState([]); // comments for category
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Fetch categories list on mount
  useEffect(() => {
    fetch("http://localhost:5000/categories_list")
      .then((res) => res.json())
      .then((d) => setCategories(d))
      .catch((err) =>
        console.error("Error fetching categories list:", err)
      );
  }, []);

  // 🔹 Fetch comments for selected category
  useEffect(() => {
    if (!selectedCategory) return;

    setLoading(true);
    setError(null);

    fetch(
      `http://localhost:5000/categorized?category=${encodeURIComponent(
        selectedCategory
      )}&page=${page}&limit=${limit}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((d) => {
        // data is a dict { category: [comments...] }
        setData(d[selectedCategory] || []);
        setHasMore((d[selectedCategory] || []).length === limit);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categorized comments:", err);
        setError("Failed to load categorized comments.");
        setLoading(false);
      });
  }, [selectedCategory, page, limit]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categorized Comments</h1>

      {/* Category selector */}
      <div className="mb-6">
        <label className="mr-2 font-medium">Select Category:</label>
<select
  value={selectedCategory}
  onChange={(e) => {
    setSelectedCategory(e.target.value);
    setPage(1); // reset page
  }}
  className="bg-white text-black border border-gray-300 px-2 py-1 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="">-- Choose a category --</option>
  {categories.map((cat, i) => (
    <option key={i} value={cat}>
      {cat}
    </option>
  ))}
</select>
      </div>

      {/* Pagination controls */}
      {selectedCategory && (
        <div className="flex items-center gap-4 mb-4">
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>

          <span>
            Page {page} ({limit} per page)
          </span>

          <button
            className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!hasMore || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>

          <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="border px-2 py-1 rounded text-black"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      )}

      {/* Error state */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Data */}
      {loading ? (
        <p className="text-gray-400 italic">Loading...</p>
      ) : data.length > 0 ? (
        <ul className="space-y-4">
          {data.map((c, i) => (
            <li
              key={i}
              className="border p-3 rounded bg-gray-100 text-black"
            >
              <p className="font-medium">{c.textOriginal}</p>
              <p className="text-sm text-gray-600">
                Category: {c.predictedCategory} | Confidence:{" "}
                {c.confidence.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                Published: {c.publishedAt}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        selectedCategory && <p>No comments found for this category.</p>
      )}
    </div>
  );
}

export default CategorizedComments;
