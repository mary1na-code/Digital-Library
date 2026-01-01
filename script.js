
// selecting DOM elements
const bookForm = document.getElementById('new-book-form');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const noOfPagesInput = document.getElementById('no-of-pages');
const summaryInput = document.getElementById('summary');
const coverIdInput = document.getElementById('cover-id');
const readInput = document.getElementById('read'); // checkbox for read status
const totalBooksEl = document.getElementById('total-books');
const readCountEl = document.getElementById('read-count');
const unreadCountEl = document.getElementById('unread-count');
const searchBtn = document.getElementById('search-online');

// capitalization function
function capitalizeString(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Book class
class Book {
  constructor({ title, author, pages, read, summary = "No summary available.", coverId = null }) {
    this.title = title;
    this.author = author;
    // pages optional: if 0, empty or falsy -> "?"
    this.pages = (pages === 0 || pages === '' || pages == null) ? "?" : pages;
    this.read = read;
    this.summary = summary;
    this.coverId = coverId;
  }

  // Toggle the boolean read status
  toggleReadStatus() {
    this.read = !this.read;
  }
}

// Library manager with storage, persistence and analytics
class LibraryManager {
  static books = [];

  static addBook(bookObj) {
    const book = new Book(bookObj);
    this.books.push(book);
    this.save();
  }

  static deleteBook(index) {
    if (!Number.isFinite(index) || index < 0 || index >= this.books.length) return;
    this.books.splice(index, 1);
    this.save();
  }

  static save() {
    // save only minimal fields
    const toSave = this.books.map(b => ({
      title: b.title,
      author: b.author,
      pages: b.pages,
      read: b.read,
      summary: b.summary,
      coverId: b.coverId
    }));
    localStorage.setItem('libraryData', JSON.stringify(toSave));
  }

  static get quickStats() {
    const totalBooks = this.books.length;
    const readCount = this.books.filter(b => b.read).length;
    const unreadCount = totalBooks - readCount;
    return { totalBooks, readCount, unreadCount };
  }

  static async searchApi(query) {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      const doc = data?.docs?.[0];
      if (!doc) return null;

      const title = doc.title || '';
      const author = Array.isArray(doc.author_name) ? doc.author_name[0] : (doc.author_name || '');
      const pages = doc.number_of_pages_median || null;
      const coverId = doc.cover_i || null;
      // first_sentence may be string or object {value: "..."}
      let summary = '';
      if (typeof doc.first_sentence === 'string') summary = doc.first_sentence;
      else if (doc.first_sentence && typeof doc.first_sentence === 'object') summary = doc.first_sentence.value || '';
      else if (Array.isArray(doc.first_sentence)) summary = doc.first_sentence[0] || '';
      else summary = '';

      return { title, author, pages, coverId, summary };
    } catch (err) {
      console.error('Search API error:', err);
      return null;
    }
  }
}

// helper to build cover URL or placeholder
function coverUrl(coverId) {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'https://via.placeholder.com/150x200?text=No+Cover';
}

// Update stats UI
function updateStats() {
  const stats = LibraryManager.quickStats;
  if (totalBooksEl) totalBooksEl.textContent = stats.totalBooks;
  if (readCountEl) readCountEl.textContent = stats.readCount;
  if (unreadCountEl) unreadCountEl.textContent = stats.unreadCount;
}

// Rendering function
function renderLibrary() {
  const library = document.getElementById('library-grid');
  library.innerHTML = '';

  LibraryManager.books.forEach((bookItem, index) => {
    const bookCard = document.createElement('div');
    const bookCover = document.createElement('img');
    const bookInfo = document.createElement('div');
    const cardTitle = document.createElement('p');
    const cardAuthor = document.createElement('p');
    const cardPages = document.createElement('p');
    const statusBtn = document.createElement('button');
    const deleteBtn = document.createElement('button');
    const summaryEl = document.createElement('div');

    bookCover.className = 'book-cover';
    bookCard.className = 'book-card';
    bookInfo.className = 'book-info';
    cardTitle.className = 'card-title';
    cardAuthor.className = 'card-author';
    cardPages.className = 'card-pages';
    statusBtn.className = 'status-btn';
    deleteBtn.className = 'delete-btn';
    summaryEl.className = 'summary-snippet';

    // cover
    bookCover.src = coverUrl(bookItem.coverId);
    bookCover.alt = `${bookItem.title} cover`;

    // Append book info elements to the book card
    bookCard.appendChild(bookCover);
    bookCard.appendChild(bookInfo);
    bookInfo.append(cardTitle, cardAuthor, cardPages, statusBtn, deleteBtn, summaryEl);

    cardTitle.textContent = `${bookItem.title}`;
    cardAuthor.textContent = `${bookItem.author}`;
    cardPages.textContent = `${bookItem.pages} pages`;
    statusBtn.textContent = bookItem.read ? "READ" : "UNREAD";
    deleteBtn.textContent = "Delete";
    summaryEl.textContent = bookItem.summary ? (bookItem.summary.length > 150 ? bookItem.summary.slice(0, 147) + '...' : bookItem.summary) : '';

    // Apply color based on status
    const statusColor = bookItem.read ? 'green' : 'red';
    statusBtn.style.color = statusColor;

    // Attach index for event delegation
    statusBtn.dataset.index = index;
    deleteBtn.dataset.index = index;

    // Append the finished card into the library grid
    library.appendChild(bookCard);
  });

  updateStats();
}

// LOCAL STORAGE FUNCTIONS
function loadLocalData() {
  const storedData = localStorage.getItem('libraryData');
  if (storedData) {
    const loadedLibrary = JSON.parse(storedData);
    loadedLibrary.forEach(bookData => {
      const bookInstance = new Book(bookData);
      LibraryManager.books.push(bookInstance);
    });
    renderLibrary();
  } else {
    updateStats();
  }
}

// load stored data on script start
loadLocalData();

// Event delegation for toggling read/unread status and delete
const libraryGrid = document.getElementById('library-grid');
libraryGrid.addEventListener('click', (event) => {
  const target = event.target;
  if (target.classList.contains('status-btn')) {
    const idx = Number(target.dataset.index);
    if (!Number.isFinite(idx)) return;
    LibraryManager.books[idx].toggleReadStatus();
    LibraryManager.save();
    renderLibrary();
  } else if (target.classList.contains('delete-btn')) {
    const idx = Number(target.dataset.index);
    if (!Number.isFinite(Number(idx))) return;
    LibraryManager.deleteBook(Number(idx));
    renderLibrary();
  }
});

// Search button listener
searchBtn.addEventListener('click', async () => {
  const q = titleInput.value.trim() || authorInput.value.trim();
  if (!q) {
    alert('Enter a title or author to search online');
    return;
  }

  searchBtn.disabled = true;
  searchBtn.textContent = 'Searching...';

  try {
    const result = await LibraryManager.searchApi(q);

    if (!result) {
      alert('No results found.');
      return;
    }

    // Auto-fill form fields
    if (result.title) titleInput.value = result.title;
    if (result.author) authorInput.value = result.author;
    if (result.pages) noOfPagesInput.value = result.pages;
    if (result.summary) summaryInput.value = result.summary;
    if (result.coverId) {
      coverIdInput.value = result.coverId;
      coverImg.src = `https://covers.openlibrary.org/b/id/${result.coverId}-L.jpg`;
    }

  } catch (err) {
    alert('Error occurred: ' + err.message);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search Online';
  }
});


// Form submit event
bookForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const noOfPages = noOfPagesInput.value.trim();
  const isRead = readInput.checked;
  const summary = summaryInput.value.trim() || "No summary available.";
  const coverId = coverIdInput.value || null;

  if (title === '' || author === '') {
    alert('Please fill in title and author');
    return;
  }

  // Add new book via LibraryManager
  LibraryManager.addBook({
    title: capitalizeString(title),
    author: capitalizeString(author),
    pages: noOfPages === '' ? null : Number(noOfPages),
    read: isRead,
    summary,
    coverId
  });

  // Update UI
  renderLibrary();

  // Clear form fields after submission (keep search convenience)
  titleInput.value = '';
  authorInput.value = '';
  noOfPagesInput.value = '';
  readInput.checked = false;
  summaryInput.value = '';
  coverIdInput.value = '';
});