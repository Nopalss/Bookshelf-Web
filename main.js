// Do your work here...

let booksSelf = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";
const DELETED_EVENT = "deleted-book";

function generateId() {
  return Number(new Date());
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBooks(bookId) {
  for (const bookItem of booksSelf) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in booksSelf) {
    if (booksSelf[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(booksSelf);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      booksSelf.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const textTitle = document.createElement("h3");
  textTitle.innerText = title;
  textTitle.setAttribute("data-testid", `bookItemTitle`);

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis : ${author}`;
  textAuthor.setAttribute("data-testid", `bookItemAuthor`);

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun : ${year}`;
  textYear.setAttribute("data-testid", `bookItemYear`);

  const buttonContainer = document.createElement("div");
  const btnComplete = document.createElement("button");
  const btnDelete = document.createElement("button");
  const btnEdit = document.createElement("button");

  btnComplete.innerText = isComplete ? "Belum dibaca" : "Selesai dibaca";
  btnDelete.innerText = "Hapus Buku";
  btnEdit.innerText = "Edit Buku";

  if (isComplete) {
    btnComplete.addEventListener("click", function () {
      removeBookFromCompleted(id);
      console.log(booksSelf);
    });
  } else {
    btnComplete.addEventListener("click", function () {
      addBookToCompleted(id);
      console.log(booksSelf);
    });
  }

  btnComplete.classList.add("selesai");
  btnComplete.setAttribute("data-testid", `bookItemIsCompleteButton`);
  btnDelete.classList.add("delete");
  btnDelete.setAttribute("data-testid", `bookItemDeleteButton`);
  btnEdit.classList.add("edit");
  btnEdit.setAttribute("data-testid", `bookItemEditButton`);

  btnDelete.addEventListener("click", function () {
    removeBook(id);
  });
  btnEdit.addEventListener("click", function () {
    formEditBook(id);
  });

  buttonContainer.append(btnComplete, btnDelete, btnEdit);

  const bookItem = document.createElement("div");
  bookItem.classList.add("book-item");
  bookItem.setAttribute("data-bookid", `book-${id}`);
  bookItem.setAttribute("data-testid", `bookItem`);
  bookItem.append(textTitle, textAuthor, textYear, buttonContainer);

  return bookItem;
}

function addBook() {
  const bookTitle = document.getElementById("bookFormTitle").value;
  const bookAuthor = document.getElementById("bookFormAuthor").value;
  const bookYear = Number(document.getElementById("bookFormYear").value);
  const bookIsComplete = document.getElementById("bookFormIsComplete").checked;
  console.log(bookIsComplete);

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    bookIsComplete
  );
  booksSelf.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBooks(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBooks(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  booksSelf.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function editBook() {}

function formEditBook(bookId) {
  const bookTarget = findBooks(bookId);
  const bookIndex = findBookIndex(bookId);
  if (bookTarget == null) return;
  const containerFormEdit = document.getElementById("containerFormEdit");
  containerFormEdit.classList.add("show");

  const bookFormIdEdit = document.getElementById("bookFormIdEdit");
  const bookTitle = document.getElementById("bookFormTitleEdit");
  const bookAuthor = document.getElementById("bookFormAuthorEdit");
  const bookYear = document.getElementById("bookFormYearEdit");
  const bookIsComplete = document.getElementById("bookFormIsCompleteEdit");
  const exit = document.getElementById("exit");

  exit.addEventListener("click", function () {
    bookFormIdEdit.value = "";
    bookTitle.value = "";
    bookAuthor.value = "";
    bookYear.value = "";
    bookIsComplete.checked = false;
    containerFormEdit.classList.remove("show");
  });

  bookFormIdEdit.value = bookTarget.id;
  bookTitle.value = bookTarget.title;
  bookAuthor.value = bookTarget.author;
  bookYear.value = bookTarget.year;
  bookIsComplete.checked = bookTarget.isComplete;
  const editForm = document.getElementById("bookFormEdit");
  editForm.addEventListener("submit", function (event) {
    event.preventDefault();

    bookTarget.title = bookTitle.value;
    bookTarget.author = bookAuthor.value;
    bookTarget.year = bookYear.value;
    bookTarget.isComplete = bookIsComplete.checked;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
    containerFormEdit.classList.remove("show");
  });
}

document.addEventListener(SAVED_EVENT, () => {
  console.log("Data berhasil di simpan.");
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById("incompleteBookList");
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completeBookList");
  completedBookList.innerHTML = "";

  for (const bookItem of booksSelf) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});
