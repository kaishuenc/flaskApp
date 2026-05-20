import express from "express";
import path from "path";
import { Pool } from "pg";
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
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("FATAL: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

// Render's managed Postgres requires SSL; locally with a non-SSL DB we disable it.
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Seed data used on first boot when tables are empty.
const INITIAL_BOOKS: Book[] = [
  { id: 'book-1', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', isbn: '978-7-111-40701-0', totalCopies: 4, availableCopies: 3, coverColor: 'from-blue-600 to-cyan-700', addedDate: '2026-01-10' },
  { id: 'book-2', title: 'The Three-Body Problem', author: 'Cixin Liu', category: 'Science Fiction', isbn: '978-7-5366-9293-0', totalCopies: 5, availableCopies: 5, coverColor: 'from-neutral-800 to-neutral-600', addedDate: '2026-02-15' },
  { id: 'book-3', title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', isbn: '978-7-115-21394-5', totalCopies: 3, availableCopies: 1, coverColor: 'from-teal-600 to-emerald-700', addedDate: '2026-03-01' },
  { id: 'book-4', title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', category: 'Literature', isbn: '978-7-5442-5399-4', totalCopies: 3, availableCopies: 2, coverColor: 'from-amber-600 to-amber-800', addedDate: '2026-03-24' },
  { id: 'book-5', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'History', isbn: '978-7-5086-4735-7', totalCopies: 2, availableCopies: 2, coverColor: 'from-rose-600 to-pink-700', addedDate: '2026-04-05' }
];

const INITIAL_RECORDS: BorrowRecord[] = [
  { id: 'rec-1', bookId: 'book-3', bookTitle: 'Clean Code', borrowerName: 'Alex Smith', borrowerId: 'STU2026001', borrowDate: '2026-05-10', dueDate: '2026-05-24', status: 'borrowed' },
  { id: 'rec-2', bookId: 'book-1', bookTitle: 'Introduction to Algorithms', borrowerName: 'Emily Watson', borrowerId: 'STU2026042', borrowDate: '2026-05-01', dueDate: '2026-05-15', returnDate: '2026-05-14', status: 'returned' },
  { id: 'rec-3', bookId: 'book-3', bookTitle: 'Clean Code', borrowerName: 'John Doe', borrowerId: 'STU2026019', borrowDate: '2026-04-20', dueDate: '2026-05-04', status: 'overdue' }
];

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      isbn TEXT NOT NULL,
      total_copies INT NOT NULL,
      available_copies INT NOT NULL,
      cover_color TEXT NOT NULL,
      added_date TEXT NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS borrow_records (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      book_title TEXT NOT NULL,
      borrower_name TEXT NOT NULL,
      borrower_id TEXT NOT NULL,
      borrow_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      return_date TEXT,
      status TEXT NOT NULL
    );
  `);

  const { rows } = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM books");
  if (parseInt(rows[0].count, 10) === 0) {
    for (const b of INITIAL_BOOKS) {
      await pool.query(
        `INSERT INTO books (id, title, author, category, isbn, total_copies, available_copies, cover_color, added_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [b.id, b.title, b.author, b.category, b.isbn, b.totalCopies, b.availableCopies, b.coverColor, b.addedDate]
      );
    }
    for (const r of INITIAL_RECORDS) {
      await pool.query(
        `INSERT INTO borrow_records (id, book_id, book_title, borrower_name, borrower_id, borrow_date, due_date, return_date, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [r.id, r.bookId, r.bookTitle, r.borrowerName, r.borrowerId, r.borrowDate, r.dueDate, r.returnDate ?? null, r.status]
      );
    }
    console.log(`Seeded ${INITIAL_BOOKS.length} books and ${INITIAL_RECORDS.length} records.`);
  }
}

// snake_case DB rows → camelCase API shape
function rowToBook(r: any): Book {
  return {
    id: r.id,
    title: r.title,
    author: r.author,
    category: r.category,
    isbn: r.isbn,
    totalCopies: r.total_copies,
    availableCopies: r.available_copies,
    coverColor: r.cover_color,
    addedDate: r.added_date,
  };
}

function rowToRecord(r: any): BorrowRecord {
  return {
    id: r.id,
    bookId: r.book_id,
    bookTitle: r.book_title,
    borrowerName: r.borrower_name,
    borrowerId: r.borrower_id,
    borrowDate: r.borrow_date,
    dueDate: r.due_date,
    returnDate: r.return_date ?? undefined,
    status: r.status,
  };
}

async function startServer() {
  await initDB();

  const app = express();
  app.use(express.json());

  // Health check — useful for Render's HTTP probe
  app.get("/api/health", async (_req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok", db: "connected" });
    } catch (err) {
      res.status(503).json({ status: "error", db: "disconnected" });
    }
  });

  app.get("/api/data", async (_req, res) => {
    const books = (await pool.query("SELECT * FROM books ORDER BY added_date DESC")).rows.map(rowToBook);
    // Newest first. borrow_date is day-precision, so same-day records would
    // tie — fall back to id DESC, which sorts our `rec-<Date.now()>-<random>`
    // ids in creation order (newer ms timestamp = larger string).
    const records = (await pool.query(
      "SELECT * FROM borrow_records ORDER BY borrow_date DESC, id DESC"
    )).rows.map(rowToRecord);
    res.json({ books, records });
  });

  app.post("/api/books", async (req, res) => {
    const b: Book = req.body;
    await pool.query(
      `INSERT INTO books (id, title, author, category, isbn, total_copies, available_copies, cover_color, added_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [b.id, b.title, b.author, b.category, b.isbn, b.totalCopies, b.availableCopies, b.coverColor, b.addedDate]
    );
    res.status(201).json({ success: true, book: b });
  });

  app.delete("/api/books/:id", async (req, res) => {
    await pool.query("DELETE FROM books WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  });

  app.post("/api/borrow", async (req, res) => {
    const { bookId, borrowerName, borrowerId, borrowDate, dueDate } = req.body;

    // Atomic decrement: only succeeds if available_copies > 0 at the moment
    // of the UPDATE. Prevents two concurrent requests from both passing a
    // SELECT check and over-borrowing the last copy.
    const decremented = await pool.query(
      `UPDATE books SET available_copies = available_copies - 1
       WHERE id = $1 AND available_copies > 0
       RETURNING *`,
      [bookId]
    );
    if (decremented.rowCount === 0) {
      return res.status(400).json({ error: "Book not available or exists in insufficient numbers." });
    }
    const bookRow = decremented.rows[0];

    const newRecord: BorrowRecord = {
      id: "rec-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      bookId,
      bookTitle: bookRow.title,
      borrowerName,
      borrowerId,
      borrowDate,
      dueDate,
      status: "borrowed",
    };

    await pool.query(
      `INSERT INTO borrow_records (id, book_id, book_title, borrower_name, borrower_id, borrow_date, due_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [newRecord.id, newRecord.bookId, newRecord.bookTitle, newRecord.borrowerName, newRecord.borrowerId, newRecord.borrowDate, newRecord.dueDate, newRecord.status]
    );

    res.status(201).json({ success: true, record: newRecord, book: rowToBook(bookRow) });
  });

  app.post("/api/return", async (req, res) => {
    const { recordId } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    // Atomic transition: status must be != 'returned' when we update.
    // A double-click can't increment available_copies twice because the
    // second UPDATE finds no row to change.
    const updated = await pool.query(
      `UPDATE borrow_records SET status = 'returned', return_date = $1
       WHERE id = $2 AND status <> 'returned'
       RETURNING *`,
      [todayStr, recordId]
    );
    if (updated.rowCount === 0) {
      return res.status(400).json({ error: "Record not found or already returned." });
    }
    const recordRow = updated.rows[0];

    const bookUpdate = await pool.query(
      `UPDATE books SET available_copies = LEAST(total_copies, available_copies + 1)
       WHERE id = $1 RETURNING *`,
      [recordRow.book_id]
    );

    res.json({
      success: true,
      record: rowToRecord(recordRow),
      book: bookUpdate.rows[0] ? rowToBook(bookUpdate.rows[0]) : null,
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
