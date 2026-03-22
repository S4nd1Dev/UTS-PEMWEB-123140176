import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import DataTable from './components/DataTable';
import DetailCard from './components/DetailCard';

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [readingList, setReadingList] = useState(() => {
    const savedList = localStorage.getItem('readingList');
    return savedList ? JSON.parse(savedList) : [];
  });

  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('readingList', JSON.stringify(readingList));
  }, [readingList]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleSearch = async (query, type) => {
    setLoading(true);
    setError(null);
    setBooks([]);
    setSelectedWorkId(null);
    setFilterSubject('');

    try {
      let url = `https://openlibrary.org/search.json?`;
      url += type === 'author'
        ? `author=${encodeURIComponent(query)}`
        : `title=${encodeURIComponent(query)}`;

      url += '&fields=key,title,author_name,first_publish_year,cover_i,subject&limit=20';

      const res = await axios.get(url);

      setBooks(res.data.docs.map(doc => ({ ...doc, key: doc.key })));

    } catch {
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToReadingList = (book) => {
    if (!readingList.some(b => b.key === book.key)) {
      setReadingList([...readingList, book]);
    }
  };

  const removeFromReadingList = (key) => {
    setReadingList(readingList.filter(b => b.key !== key));
  };

  const allSubjects = useMemo(() => {
    const s = new Set();
    books.forEach(b => b.subject?.forEach(x => s.add(x)));
    return [...s].sort();
  }, [books]);

  const filteredBooks = filterSubject
    ? books.filter(b => b.subject?.includes(filterSubject))
    : books;

  return (
    <>
      <Header onThemeToggle={() => setIsDarkMode(p => !p)} />

      <main className="container">

        {/* 🔥 HERO */}
        <section className="hero">
          <h1>📚 Book Finder App</h1>
          <p>Search your favorite books & manage your reading list easily.</p>
        </section>

        <section className="section">
          <SearchForm onSearch={handleSearch} loading={loading} />
        </section>

        {/* FILTER */}
        {books.length > 0 && (
          <div className="filter-controls">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {allSubjects.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* RESULT */}
        <section className="section">
          <h2>Search Results</h2>

          {!loading && filteredBooks.length === 0 && (
            <p className="empty">No books found. Try searching something 🔍</p>
          )}

          <DataTable
            books={filteredBooks}
            loading={loading}
            error={error}
            onAdd={addToReadingList}
            onShowDetail={setSelectedWorkId}
          />
        </section>

        {/* LIST */}
        <section className="section">
          <h2>📖 My Reading List</h2>

          {readingList.length === 0 && (
            <p className="empty">Your list is empty 🚀</p>
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