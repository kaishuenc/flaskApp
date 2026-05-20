import { Book, BorrowRecord } from './types';

export const CATEGORIES = [
  'Computer Science',
  'Literature',
  'Science Fiction',
  'History',
  'Business',
  'Art & Design'
];

export const INITIAL_BOOKS: Book[] = [
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
  },
  {
    id: 'book-6',
    title: 'The Effective Executive',
    author: 'Peter F. Drucker',
    category: 'Business',
    isbn: '978-7-111-16447-0',
    totalCopies: 3,
    availableCopies: 3,
    coverColor: 'from-violet-600 to-purple-800',
    addedDate: '2026-04-12'
  }
];

export const INITIAL_RECORDS: BorrowRecord[] = [
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
