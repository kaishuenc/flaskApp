import { useState, useEffect } from 'react';
import { Book, BorrowRecord, ActiveTab } from './types';
import { CATEGORIES } from './data';
import Stats from './components/Stats';
import AddBookModal from './components/AddBookModal';
import BorrowModal from './components/BorrowModal';
import { 
  Library, 
  BookOpen, 
  History, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Trash2,
  BookmarkPlus
} from 'lucide-react';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState('');

  const [activeTab, setActiveTab] = useState<ActiveTab>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [showAddBook, setShowAddBook] = useState(false);
  const [lendingBook, setLendingBook] = useState<Book | null>(null);

  // Fetch initial books & logs from Express backend API
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Failed to reach backend API');
      const data = await res.json();
      setBooks(data.books || []);
      setRecords(data.records || []);
    } catch (err: any) {
      setErrorHeader('Error loading system database. Displaying local cache.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleAddBook = async (newBook: Book) => {
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      });
      if (res.ok) {
        await fetchData();
        setShowAddBook(false);
      }
    } catch (error) {
      alert('Could not sync newly added book with background service.');
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this book from the catalog?')) {
      try {
        const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
        if (res.ok) {
          await fetchData();
        }
      } catch (error) {
        alert('Could not remove the selected book.');
      }
    }
  };

  const handleOpenBorrow = (book: Book) => {
    if (book.availableCopies <= 0) {
      alert('Sorry, there are no active physical copies of this book left to leverage.');
      return;
    }
    setLendingBook(book);
  };

  const handleConfirmBorrow = async (formData: { borrowerName: string; borrowerId: string; borrowDate: string; dueDate: string }) => {
    if (!lendingBook) return;

    try {
      const res = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: lendingBook.id,
          borrowerName: formData.borrowerName,
          borrowerId: formData.borrowerId,
          borrowDate: formData.borrowDate,
          dueDate: formData.dueDate,
        }),
      });
      if (res.ok) {
        await fetchData();
        setLendingBook(null);
      }
    } catch (error) {
      alert('Could not issue book.');
    }
  };

  const handleReturnBook = async (recordId: string) => {
    try {
      const res = await fetch('/api/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      alert('Failed to return book.');
    }
  };

  // Filtered books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.isbn.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filtered records
  const filteredRecords = records.filter(rec => {
    const matchesSearch = rec.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rec.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rec.borrowerId.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Banner / Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2 rounded-xl text-white shadow-xs">
                  <Library size={22} />
                </div>
                <span className="font-bold text-lg text-slate-800 tracking-tight">Library Ledger</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 rounded-sm px-1.5 py-0.5 ml-1 font-mono">
                  Full-stack Express + React
                </span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                <button
                  onClick={() => { setActiveTab('books'); setSearchQuery(''); }}
                  className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors gap-2 ${
                    activeTab === 'books'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen size={16} />
                  Book Inventory
                </button>
                <button
                  onClick={() => { setActiveTab('history'); setSearchQuery(''); }}
                  className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors gap-2 ${
                    activeTab === 'history'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <History size={16} />
                  Borrow logs
                </button>
              </div>
            </div>

            {/* DateTime Display & Quick Add */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end text-right font-mono text-xs text-slate-400">
                <span>System Date: 2026-05-19</span>
                <span className="text-emerald-500 font-semibold">• Express Server Connected</span>
              </div>
              <button
                onClick={() => setShowAddBook(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 shadow-xs transition-all hover:shadow-md cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Book</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorHeader && (
          <div className="mb-4 p-3 text-sm bg-rose-50 text-rose-600 border border-rose-100 rounded-lg">
            {errorHeader}
          </div>
        )}

        {/* Dashboard KPIs display */}
        <Stats books={books} records={records} />

        {/* Action controls grid based on activeTab */}
        <div id="shelf-panel" className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          {/* Section Header with dynamic tabs & search query */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {activeTab === 'books' ? 'Shelved book inventory' : 'Borrow / Return History Logs'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {activeTab === 'books' 
                  ? 'Search by title, author, or ISBN. Filter books dynamically by Category.' 
                  : 'Track and review past activity, check on-holds, overdues and perform easy returns.'}
              </p>
            </div>

            {/* Filter actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Common Search Box */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'books' ? 'Search title / author / ISBN...' : 'Search book / borrower name...'}
                  className="pl-9 pr-3 py-2 w-full md:w-60 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Tab-specific selectors */}
              {activeTab === 'books' ? (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
                  <span className="text-xs text-slate-400 px-2 font-medium">Category</span>
                  <select
                    className="pr-6 bg-transparent border-0 text-xs font-semibold text-slate-600 focus:outline-hidden cursor-pointer"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Genres</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
                  <span className="text-xs text-slate-400 px-2 font-medium">Status</span>
                  <select
                    className="pr-6 bg-transparent border-0 text-xs font-semibold text-slate-600 focus:outline-hidden cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Records</option>
                    <option value="borrowed">Borrowed</option>
                    <option value="overdue">Overdue</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-slate-400 text-xs font-medium mt-3">Interrogating live express database...</p>
            </div>
          ) : (
            <>
              {/* Book Catalog Grid tab */}
              {activeTab === 'books' && (
                <div className="p-6">
                  {filteredBooks.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                        <Search size={28} />
                      </div>
                      <h3 className="font-semibold text-slate-700">No matching books found</h3>
                      <p className="text-sm text-slate-400 mt-1">Try changing filter parameters or add a new book.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredBooks.map((book) => {
                        const progress = (book.availableCopies / book.totalCopies) * 100;
                        return (
                          <div key={book.id} className="border border-slate-100 rounded-2xl p-5 flex gap-5 hover:border-slate-200 hover:shadow-md transition-all relative group bg-white">
                            {/* Interactive mini graphical book cover with dynamic text */}
                            <div className={`w-24 h-32 rounded-xl bg-gradient-to-br ${book.coverColor} shadow-md flex-shrink-0 flex flex-col justify-between p-3 text-white overflow-hidden relative`}>
                              <div className="absolute top-0 right-0 w-8 h-24 bg-white/5 rotate-12 transform origin-top-right pointer-events-none" />
                              <div className="text-[9px] uppercase tracking-wider opacity-60 font-mono line-clamp-1">
                                {book.category}
                              </div>
                              <div className="font-bold text-xs leading-tight line-clamp-3 my-auto">
                                {book.title}
                              </div>
                              <div className="text-[9px] opacity-75 font-medium truncate">
                                {book.author}
                              </div>
                            </div>

                            {/* Details and checkout actions */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-1">
                                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                    {book.category}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteBook(book.id)}
                                    className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                                    title="Dismount book cover"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <h3 className="font-bold text-slate-800 text-base mt-2 line-clamp-2" title={book.title}>
                                  {book.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 font-medium truncate">By {book.author}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ISBN: {book.isbn}</p>
                              </div>

                              {/* Inventory allocation status */}
                              <div className="mt-4">
                                <div className="flex justify-between items-center text-xs mb-1">
                                  <span className="text-slate-500">
                                    Available: <span className="font-bold text-slate-700">{book.availableCopies}</span> / {book.totalCopies}
                                  </span>
                                  <span className={`font-semibold ${book.availableCopies > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {book.availableCopies > 0 ? 'In Stock' : 'Out of Stock'}
                                  </span>
                                </div>
                                {/* Visual Progress bar stock */}
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      book.availableCopies === 0 
                                        ? 'bg-slate-300' 
                                        : progress < 35 
                                          ? 'bg-amber-500' 
                                          : 'bg-indigo-500'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>

                                {/* Main Loan action */}
                                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-400">Added {book.addedDate}</span>
                                  <button
                                    onClick={() => handleOpenBorrow(book)}
                                    disabled={book.availableCopies <= 0}
                                    className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-semibold cursor-pointer ${
                                      book.availableCopies > 0
                                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                        : 'bg-slate-50 text-slate-300 pointer-events-none'
                                    }`}
                                  >
                                    <BookmarkPlus size={14} />
                                    Borrow Book
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Borrow Records Detail Tab */}
              {activeTab === 'history' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Borrower</th>
                        <th className="px-6 py-4">Card / Phone</th>
                        <th className="px-6 py-4">Issue Date</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4 font-semibold">Status / Return Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-16 text-slate-400">
                            <History size={36} className="mx-auto text-slate-300 mb-3" />
                            <h4 className="font-semibold text-slate-700">No borrow logs found</h4>
                            <p className="text-xs text-slate-400 mt-1">Go to Book Inventory tab to issue copy records.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((rec) => {
                          const isBorrowed = rec.status === 'borrowed';
                          const isOverdue = rec.status === 'overdue';
                          const isReturned = rec.status === 'returned';

                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="px-6 py-4 font-semibold text-slate-800">
                                {rec.bookTitle}
                              </td>
                              <td className="px-6 py-4 font-medium">
                                {rec.borrowerName}
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                {rec.borrowerId}
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                {rec.borrowDate}
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                {rec.dueDate}
                              </td>
                              <td className="px-6 py-4">
                                {isReturned && (
                                  <div className="flex flex-col">
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium w-fit">
                                      <CheckCircle2 size={12} />
                                      Returned
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">Date: {rec.returnDate}</span>
                                  </div>
                                )}
                                {isBorrowed && (
                                  <span className="inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium w-fit">
                                    <Clock size={12} />
                                    Active
                                  </span>
                                )}
                                {isOverdue && (
                                  <span className="inline-flex items-center gap-1 text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-medium w-fit animate-pulse">
                                    <AlertTriangle size={12} />
                                    Overdue
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {isReturned ? (
                                  <span className="text-slate-300 text-xs">No Actions</span>
                                ) : (
                                  <button
                                    onClick={() => handleReturnBook(rec.id)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                                  >
                                    <RotateCcw size={12} />
                                    Return Book
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer System Meta */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 Library Ledger Ledger System. Real-time persisted full-stack state client.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Database Sync: ONLINE</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {showAddBook && (
        <AddBookModal 
          onAdd={handleAddBook} 
          onClose={() => setShowAddBook(false)} 
        />
      )}

      {lendingBook && (
        <BorrowModal 
          book={lendingBook} 
          onBorrow={handleConfirmBorrow} 
          onClose={() => setLendingBook(null)} 
        />
      )}
    </div>
  );
}
