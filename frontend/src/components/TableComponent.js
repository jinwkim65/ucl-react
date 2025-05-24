// TableComponent.jsx
import { useEffect, useState } from 'react';

const PAGE_SIZE = 10;

function TableComponent() {
  const [tournament, setTournament] = useState('');
  const [level,      setLevel]      = useState('');
  const [year,       setYear]       = useState('');
  const [results,    setResults]    = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
      tournament: tournament + '%' || '%',
      level:      level + '%'      || '%',
      year:       year + '%'       || '%',
    });

    fetch(`http://127.0.0.1:5000/search/${page}?${params}`)
      .then(res  => res.json())
      .then(data => {
        setResults(data.results);
        setTotal(data.total);
        setHasMore(data.results.length === PAGE_SIZE);
      })
      .catch(console.error);
  }, [tournament, level, year, page]);

  useEffect(() => setPage(1), [tournament, level, year]);

  // "I'm Feeling Lucky" handler
  const handleLucky = () => {
    if (!results.length) return;
    const randomIndex = Math.floor(Math.random() * results.length);
    const r = results[randomIndex];
    const fileName = `${r.tournament}_${r.level}_${r.year}.pdf`;
    const pdfUrl  = `http://127.0.0.1:5000/rounds/${r.tournament}/${fileName}`;
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center text-white">Ultimate Certamen Library</h2>

      {/* Filters + Lucky Button */}
      <form className="row g-3 align-items-end justify-content-center mb-4">
        <div className="col-sm-3">
          <label className="form-label visually-hidden" htmlFor="tournament-input">Tournament</label>
          <input
            id="tournament-input"
            type="text"
            className="form-control"
            value={tournament}
            onChange={e => setTournament(e.target.value)}
            placeholder="Tournament"
          />
        </div>
        <div className="col-sm-2">
          <label className="form-label visually-hidden" htmlFor="level-input">Level</label>
          <input
            id="level-input"
            type="text"
            className="form-control"
            value={level}
            onChange={e => setLevel(e.target.value)}
            placeholder="Level"
          />
        </div>
        <div className="col-sm-2">
          <label className="form-label visually-hidden" htmlFor="year-input">Year</label>
          <input
            id="year-input"
            type="text"
            className="form-control"
            value={year}
            onChange={e => setYear(e.target.value)}
            placeholder="Year"
          />
        </div>
        <div className="col-sm-2 d-grid">
          <button
            type="button"
            className="btn btn-warning"
            onClick={handleLucky}
            disabled={!results.length}
          >
            Pick One for Me!
          </button>
        </div>
      </form>

      {/* Results Table */}
      <div className="table-responsive mb-3">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Tournament</th>
              <th>Level</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((r, i) => {
                const fileName = `${r.tournament}_${r.level}_${r.year}.pdf`;
                const pdfUrl  = `http://127.0.0.1:5000/static/rounds/${r.tournament}/${fileName}`;
                return (
                  <tr
                    key={i}
                    style={{ cursor: 'pointer' }}
                    onClick={() => window.open(pdfUrl, '_blank')}
                  >
                    <td>{r.tournament}</td>
                    <td>{r.level}</td>
                    <td>{r.year}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-light"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          ← Previous
        </button>

        <span className="align-self-center text-white">
          Page {page} ({total} results)
        </span>

        <button
          className="btn btn-outline-light"
          onClick={() => setPage(p => p + 1)}
          disabled={!hasMore}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default TableComponent;
