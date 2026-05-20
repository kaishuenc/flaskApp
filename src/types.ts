export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  coverColor: string; // Tailwind class like bg-emerald-500, bg-amber-500, etc.
  addedDate: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowerName: string;
  borrowerId: string; // e.g., Student ID or Contact number
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

export type ActiveTab = 'books' | 'borrow' | 'history' | 'dashboard';
