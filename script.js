// selecting DOM elements
const bookForm = document.getElementById('new-book-form');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const noOfPagesInput = document.getElementById('no-of-pages');
const readInput = document.getElementById('read'); // checkbox for read status
const totalBooksEl = document.getElementById('total-books');
const totalPagesEl = document.getElementById('total-pages');

// capitalization function
function capitalizeString(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Book class
class Book {
  constructor({ title, author, pages, read }) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
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
    localStorage.setItem('libraryData', JSON.stringify(this.books));
  }

  static get quickStats() {
    const totalBooks = this.books.length;
    const totalPages = this.books.reduce((sum, b) => sum + (Number(b.pages) || 0), 0);
    const readCount = this.books.filter(b => b.read).length;
    const unreadCount = totalBooks - readCount;
    return { totalBooks, totalPages, readCount, unreadCount };
  }
}

// Update stats UI
function updateStats() {
  const stats = LibraryManager.quickStats;
  if (totalBooksEl) totalBooksEl.textContent = stats.totalBooks;
  if (totalPagesEl) totalPagesEl.textContent = stats.totalPages;
}

// Rendering function
function renderLibrary() {
  const library = document.getElementById('library-grid');
  library.innerHTML = '';

  LibraryManager.books.forEach((bookItem, index) => {
    const bookCard = document.createElement('div');
    const bookInfo = document.createElement('div');
    const cardTitle = document.createElement('p');
    const cardAuthor = document.createElement('p');
    const cardPages = document.createElement('p');
    const statusBtn = document.createElement('button');
    const deleteBtn = document.createElement('button');

    bookCard.className = 'book-card';
    bookInfo.className = 'book-info';
    cardTitle.className = 'card-title';
    cardAuthor.className = 'card-author';
    cardPages.className = 'card-pages';
    statusBtn.className = 'status-btn';
    deleteBtn.className = 'delete-btn';

    // Append book info elements to the book card
    bookCard.appendChild(bookInfo);
    bookInfo.append(cardTitle, cardAuthor, cardPages, statusBtn, deleteBtn);

    cardTitle.textContent = `${bookItem.title}`;
    cardAuthor.textContent = `${bookItem.author}`;
    cardPages.textContent = `${bookItem.pages} pages`;
    statusBtn.textContent = bookItem.read ? "READ" : "UNREAD";
    deleteBtn.textContent = "Delete";

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

// Form submit event
bookForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const noOfPages = noOfPagesInput.value.trim();
  const isRead = readInput.checked;

  if (title === '' || author === '' || noOfPages === '') {
    alert('Please fill in all fields');
    return;
  }

  // Add new book via LibraryManager
  LibraryManager.addBook({
    title: capitalizeString(title),
    author: capitalizeString(author),
    pages: Number(noOfPages),
    read: isRead
  });

  // Update UI
  renderLibrary();

  // Clear form fields after submission
  titleInput.value = '';
  authorInput.value = '';
  noOfPagesInput.value = '';
  readInput.checked = false;
});