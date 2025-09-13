import React, { useEffect, useState } from "react";

function Comments() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/comments?page=${page}&limit=${limit}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((d) => {
        setData(d);
        setHasMore(d.length === limit);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments.");
        setLoading(false);
      });
  }, [page, limit]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Comments</h1>

      {/* Pagination controls */}
      <div className="flex items-center gap-4 mb-4">
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>

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
          className="border px-2 py-1 rounded"
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>per page</span>
      </div>

      {/* Error state */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Data */}
      {loading ? (
        <p>Loading...</p>
      ) : data.length > 0 ? (
        <table className="table-auto w-full text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1">Comment</th>
              <th className="px-2 py-1">Sentiment</th>
              <th className="px-2 py-1">Published</th>
              <th className="px-2 py-1">Quality</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{row.textOriginal}</td>
                <td className="border px-2 py-1">{row.sentiment}</td>
                <td className="border px-2 py-1">
                  {new Date(row.publishedAt).toLocaleDateString()}
                </td>
                <td className="border px-2 py-1 whitespace-normal break-words w-40">
                  {row.QualityCategory}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No more comments.</p>
      )}
    </div>
  );
}

export default Comments;
