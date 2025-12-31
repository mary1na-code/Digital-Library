// selecting DOM elements
const bookForm = document.getElementById('new-book-form');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const noOfPagesInput = document.getElementById('no-of-pages');
const readInput = document.getElementById('read'); // checkbox for read status

// capitalization function
function capitalizeString(str) {
return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Book class
class Book {
constructor(title, author, pages, read) {
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

// Storage array for book objects
const Library = [];

// Rendering function
function renderLibrary() {
const library = document.getElementById('library-grid');
library.innerHTML = '';

Library.forEach((bookItem, index) => {
const bookCard = document.createElement('div');
const bookInfo = document.createElement('div');
const cardTitle = document.createElement('p');
const cardAuthor = document.createElement('p');
const cardPages = document.createElement('p');
const statusBtn = document.createElement('button');

bookCard.className = 'book-card';
bookInfo.className = 'book-info';
cardTitle.className = 'card-title';
cardAuthor.className = 'card-author';
cardPages.className = 'card-pages';
statusBtn.className = 'status-btn';

// Append book info elements to the book card
bookCard.appendChild(bookInfo);
bookInfo.append(cardTitle, cardAuthor, cardPages, statusBtn);

cardTitle.textContent = `${bookItem.title}`;
cardAuthor.textContent = `${bookItem.author}`;
cardPages.textContent = `${bookItem.pages} pages`;
statusBtn.textContent = bookItem.read ? "READ" : "UNREAD";

// Apply color based on status
const statusColor = bookItem.read ? 'green' : 'red';
statusBtn.style.color = statusColor;

// Attach index for event delegation
statusBtn.dataset.index = index;

// Append the finished card into the library grid
library.appendChild(bookCard);
});
}

// LOCAL STORAGE FUNCTIONS
function saveLocalStorage() {
localStorage.setItem('libraryData', JSON.stringify(Library));
}

function loadLocalData() {
const storedData = localStorage.getItem('libraryData');
if (storedData) {
const loadedLibrary = JSON.parse(storedData);
loadedLibrary.forEach(bookData => {
const bookInstance = new Book(bookData.title, bookData.author, bookData.pages, bookData.read);
Library.push(bookInstance);
});
renderLibrary();
}
}

// load stored data on script start
loadLocalData();

// Event delegation for toggling read/unread status
const libraryGrid = document.getElementById('library-grid');
libraryGrid.addEventListener('click', (event) => {
const target = event.target;
if (target.classList.contains('status-btn')) {
const idx = Number(target.dataset.index);
if (!Number.isFinite(idx)) return;
Library[idx].toggleReadStatus();
saveLocalStorage();
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

const newBook = new Book(
capitalizeString(title),
capitalizeString(author),
Number(noOfPages),
isRead
);

Library.push(newBook);
renderLibrary();
saveLocalStorage();

// Clear form fields after submission
titleInput.value = '';
authorInput.value = '';
noOfPagesInput.value = '';
readInput.checked = false;
});

