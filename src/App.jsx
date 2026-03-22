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

  // Load localStorage
  useEffect(() => {
    const savedList = localStorage.getItem("readingList");
    const savedTheme = localStorage.getItem("theme");

    if (savedList) setReadingList(JSON.parse(savedList));
    if (savedTheme === "dark") setIsDarkMode(true);
  }, []);

  // Save reading list
  useEffect(() => {
    localStorage.setItem("readingList", JSON.stringify(readingList));
  }, [readingList]);

  // Theme
  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // SEARCH
  const handleSearch = async (query, type) => {
    setLoading(true);
    setError(null);
    setBooks([]);
    setFilterSubject("");

    try {
      let url = "https://openlibrary.org/search.json?";
      url +=
        type === "author"
          ? `author=${encodeURIComponent(query)}`
          : `title=${encodeURIComponent(query)}`;

      url +=
        "&fields=key,title,author_name,first_publish_year,cover_i,subject&limit=50";

      const res = await axios.get(url);
      setBooks(res.data.docs);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // ADD
  const addToReadingList = (book) => {
    if (!readingList.find((b) => b.key === book.key)) {
      setReadingList([...readingList, book]);
    }
  };

  // REMOVE
  const removeFromReadingList = (key) => {
    setReadingList(readingList.filter((b) => b.key !== key));
  };

  // SUBJECT FILTER
  const subjects = useMemo(() => {
    const set = new Set();
    books.forEach((b) => b.subject?.forEach((s) => set.add(s)));
    return [...set];
  }, [books]);

  const filteredBooks = filterSubject
    ? books.filter((b) => b.subject?.includes(filterSubject))
    : books;

  return (
    <>
      <Header onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

      <main className="container">
        {/* HERO */}
        <section className="hero">
          <h1>📚 Book Finder</h1>
          <p>Search books & manage your reading list easily</p>
        </section>

        {/* SEARCH */}
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* FILTER */}
        {books.length > 0 && (
          <div className="filter">
            <select onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* RESULT */}
        <section>
          <h2>Results</h2>

          {loading && <p className="info">Loading...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && books.length === 0 && (
            <p className="empty">No books found</p>
          )}

          <DataTable
            books={filteredBooks}
            onAdd={addToReadingList}
            onShowDetail={setSelectedWorkId}
          />
        </section>

        {/* LIST */}
        <section>
          <h2>📖 My Reading List</h2>

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

        {/* DETAIL */}
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