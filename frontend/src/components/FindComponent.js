// FindComponent.jsx
import React, { useState } from 'react';

const PAGE_SIZE = 10;

function FindComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResults = async (pageNum = 1) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ search: query });
      const response = await fetch(
        `http://127.0.0.1:5000/find/${pageNum}?${params}`
      );
      const data = await response.json();
      if (response.ok) {
        setResults(data.results);
        setTotal(data.total);
        setPage(pageNum);
        setHasMore(data.results.length === PAGE_SIZE);
      } else {
        setError(data.error || 'Search failed');
        setResults([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
      setResults([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchResults(1);
  };

  const openPdf = (tournament, level, year) => {
    const fileName = `${tournament}_${level}_${year}.pdf`;
    const pdfUrl = `http://127.0.0.1:5000/rounds/${tournament}/${fileName}`;
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center text-white">Ultimate Certamen Search</h2>

      {/* Search Bar with Enter key support */}
      <form
        className="row g-3 justify-content-center mb-4"
        onSubmit={handleSearch}
      >
        <div className="col-sm-6">
          <input
            type="text"
            className="form-control"
            placeholder="Enter keyword..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="col-sm-2 d-grid">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !query.trim()}
          >
            Search
          </button>
        </div>
      </form>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Results Table */}
      <div className="table-responsive mb-3">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Tournament</th>
              <th>Level</th>
              <th>Year</th>
              <th>Snippet</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((r, idx) => (
                <tr
                  key={idx}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openPdf(r.tournament, r.level, r.year)}
                >
                  <td>{r.tournament}</td>
                  <td>{r.level}</td>
                  <td>{r.year}</td>
                  <td>{r.snippet}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  {loading ? 'Loading...' : 'No results found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {results.length > 0 && (
        <div className="d-flex justify-content-between">
          <button
            className="btn btn-outline-light"
            onClick={() => fetchResults(page - 1)}
            disabled={page === 1 || loading}
          >
            ← Previous
          </button>

          <span className="align-self-center text-white">Page {page} ({total} results)</span>

          <button
            className="btn btn-outline-light"
            onClick={() => fetchResults(page + 1)}
            disabled={!hasMore || loading}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default FindComponent;
