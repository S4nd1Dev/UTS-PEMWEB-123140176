import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import DataTable from "./components/DataTable";
import DetailCard from "./components/DetailCard";
import "./app.css";

function App() {
  const [books, setBooks] = useState([]);
  const [readingList, setReadingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [filterSubject, setFilterSubject] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [page, setPage] = useState(1);
  const [searchState, setSearchState] = useState({ query: "", type: "title" });

  // Load localStorage
  useEffect(() => {
    const savedList = localStorage.getItem("readingList");
    const savedTheme = localStorage.getItem("theme");

    if (savedList) setReadingList(JSON.parse(savedList));
    if (savedTheme === "dark") setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("readingList", JSON.stringify(readingList));
  }, [readingList]);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (!searchState.query) return;

    const controller = new AbortController();

    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = "https://openlibrary.org/search.json";
        const params = new URLSearchParams();
        params.append(searchState.type, searchState.query);
        params.append("limit", "100");
        params.append("page", page.toString());

        const res = await axios.get(`${baseUrl}?${params.toString()}`, {
          signal: controller.signal,
        });

        setBooks(res.data.docs || []);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError("Could not load books. Coba lagi.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();

    return () => controller.abort();
  }, [searchState, page]);

  const handleSearch = (query, type) => {
    setSearchState({ query: query.trim(), type });
    setFilterSubject("");
    setPage(1);
  };

  const addToReadingList = (book) => {
    if (!readingList.find((b) => b.key === book.key)) {
      setReadingList([...readingList, book]);
    }
  };

  const removeFromReadingList = (key) => {
    setReadingList(readingList.filter((b) => b.key !== key));
  };

  const subjects = useMemo(() => {
    const s = new Set();
    books.forEach((b) => b.subject?.forEach((x) => s.add(x)));
    return [...s];
  }, [books]);

  const filteredBooks = filterSubject
    ? books.filter((b) => b.subject?.includes(filterSubject))
    : books;

  return (
    <>
      <Header onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

      <main className="container">

        {/* HERO */}
        <section id="search" className="hero">
          <h1>📚 Book Finder</h1>
          <p>Modern book search with reading list</p>
        </section>

        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* FILTER */}
        {books.length > 0 && (
          <div className="filter">
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* RESULT */}
        <section>
          <h2>Results</h2>

          <DataTable
            books={filteredBooks}
            loading={loading}
            error={error}
            onAdd={addToReadingList}
            onShowDetail={setSelectedWorkId}
          />

          {/* PAGINATION */}
          {searchState.query && (
            <div className="pagination">
              <button disabled={page === 1 || loading} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                Prev
              </button>
              <span>Page {page}</span>
              <button disabled={loading} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </section>

        {/* LIST */}
        <section>
          <h2>📖 My List</h2>

          {readingList.length === 0 && (
            <p className="empty">Your list is empty</p>
          )}

          <DataTable
            books={readingList}
            isReadingList
            onRemove={removeFromReadingList}
            onShowDetail={setSelectedWorkId}
          />
        </section>

        {selectedWorkId && (
          <DetailCard
            workId={selectedWorkId}
            onClose={() => setSelectedWorkId(null)}
          />
        )}
      </main>
    </>
  );
}

export default App;