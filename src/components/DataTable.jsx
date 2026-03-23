import React from 'react';

const COVER_PLACEHOLDER = 'https://via.placeholder.com/60x90.png?text=No+Cover';

function DataTable({ 
  books, 
  loading, 
  error, 
  isReadingList = false, 
  onAdd, 
  onRemove, 
  onShowDetail 
}) {

  if (loading) {
    return <div className="loading-message">Loading results...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (books.length === 0) {
    return <div className="info-message">
      {isReadingList ? 'Your reading list is empty.' : 'No books found. Try a different search.'}
    </div>;
  }

  return (
    <div className="books-grid">
      {books.map((book) => {
        const coverUrl = book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : COVER_PLACEHOLDER;

        return (
          <article key={book.key} className="book-card">
            <img src={coverUrl} alt={book.title} className="book-cover" />

            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="book-meta">{book.author_name?.join(', ') || 'Unknown Author'}</p>
              <p className="book-meta">Published: {book.first_publish_year || 'N/A'}</p>

              <div className="card-actions">
                {isReadingList ? (
                  <button className="action-btn btn-remove" onClick={() => onRemove(book.key)}>
                    Remove
                  </button>
                ) : (
                  <button className="action-btn btn-add" onClick={() => onAdd(book)}>
                    Add
                  </button>
                )}

                <button className="action-btn btn-detail" onClick={() => onShowDetail(book.key)}>
                  Detail
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default DataTable;