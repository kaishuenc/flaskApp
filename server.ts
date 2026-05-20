import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  coverColor: string;
  addedDate: string;
}

interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowerName: string;
  borrowerId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(process.cwd(), "db.json");

// Default initial data in English
const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    category: 'Computer Science',
    isbn: '978-7-111-40701-0',
    totalCopies: 4,
    availableCopies: 3,
    coverColor: 'from-blue-600 to-cyan-700',
    addedDate: '2026-01-10'
  },
  {
    id: 'book-2',
    title: 'The Three-Body Problem',
    author: 'Cixin Liu',
    category: 'Science Fiction',
    isbn: '978-7-5366-9293-0',
    totalCopies: 5,
    availableCopies: 5,
    coverColor: 'from-neutral-800 to-neutral-600',
    addedDate: '2026-02-15'
  },
  {
    id: 'book-3',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Computer Science',
    isbn: '978-7-115-21394-5',
    totalCopies: 3,
    availableCopies: 1,
    coverColor: 'from-teal-600 to-emerald-700',
    addedDate: '2026-03-01'
  },
  {
    id: 'book-4',
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel García Márquez',
    category: 'Literature',
    isbn: '978-7-5442-5399-4',
    totalCopies: 3,
    availableCopies: 2,
    coverColor: 'from-amber-600 to-amber-800',
    addedDate: '2026-03-24'
  },
  {
    id: 'book-5',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'History',
    isbn: '978-7-5086-4735-7',
    totalCopies: 2,
    availableCopies: 2,
    coverColor: 'from-rose-600 to-pink-700',
    addedDate: '2026-04-05'
  }
];

const INITIAL_RECORDS: BorrowRecord[] = [
  {
    id: 'rec-1',
    bookId: 'book-3',
    bookTitle: 'Clean Code',
    borrowerName: 'Alex Smith',
    borrowerId: 'STU2026001',
    borrowDate: '2026-05-10',
    dueDate: '2026-05-24',
    status: 'borrowed'
  },
  {
    id: 'rec-2',
    bookId: 'book-1',
    bookTitle: 'Introduction to Algorithms',
    borrowerName: 'Emily Watson',
    borrowerId: 'STU2026042',
    borrowDate: '2026-05-01',
    dueDate: '2026-05-15',
    returnDate: '2026-05-14',
    status: 'returned'
  },
  {
    id: 'rec-3',
    bookId: 'book-3',
    bookTitle: 'Clean Code',
    borrowerName: 'John Doe',
    borrowerId: 'STU2026019',
    borrowDate: '2026-04-20',
    dueDate: '2026-05-04',
    status: 'overdue'
  }
];

// Load database helper
function loadDB(): { books: Book[]; records: BorrowRecord[] } {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      return {
        books: parsed.books || INITIAL_BOOKS,
        records: parsed.records || INITIAL_RECORDS
      };
    }
  } catch (err) {
    console.error("Failed to load db.json, falling back to initial data.", err);
  }
  return { books: INITIAL_BOOKS, records: INITIAL_RECORDS };
}

// Save database helper
function saveDB(data: { books: Book[]; records: BorrowRecord[] }) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save DB changes to disk.", err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API - Get Library Data
  app.get("/api/data", (req, res) => {
    const db = loadDB();
    res.json(db);
  });

  // API - Add Book
  app.post("/api/books", (req, res) => {
    const db = loadDB();
    const newBook: Book = req.body;
    db.books.unshift(newBook);
    saveDB(db);
    res.status(201).json({ success: true, book: newBook });
  });

  // API - Delete Book
  app.delete("/api/books/:id", (req, res) => {
    const db = loadDB();
    const { id } = req.params;
    db.books = db.books.filter(b => b.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  // API - Borrow Book
  app.post("/api/borrow", (req, res) => {
    const db = loadDB();
    const { bookId, borrowerName, borrowerId, borrowDate, dueDate } = req.body;
    
    const book = db.books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ error: "Book not available or exists in insufficient numbers." });
    }

    // Decrement available copies
    book.availableCopies = Math.max(0, book.availableCopies - 1);

    // Create record
    const newRecord: BorrowRecord = {
      id: "rec-" + Date.now(),
      bookId,
      bookTitle: book.title,
      borrowerName,
      borrowerId,
      borrowDate,
      dueDate,
      status: "borrowed"
    };

    db.records.unshift(newRecord);
    saveDB(db);
    res.status(201).json({ success: true, record: newRecord, book });
  });

  // API - Return Book
  app.post("/api/return", (req, res) => {
    const db = loadDB();
    const { recordId } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const record = db.records.find(r => r.id === recordId);
    if (!record || record.status === "returned") {
      return res.status(400).json({ error: "Record not found or already returned." });
    }

    record.status = "returned";
    record.returnDate = todayStr;

    // Increment book’s available balance
    const book = db.books.find(b => b.id === record.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    }

    saveDB(db);
    res.json({ success: true, record, book });
  });

  // Vite Integration & Static Assets Static Routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
