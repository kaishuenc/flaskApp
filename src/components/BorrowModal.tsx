import React, { useState } from 'react';
import { Book, BorrowRecord } from '../types';
import { X, Calendar, User, CreditCard } from 'lucide-react';

interface BorrowModalProps {
  book: Book;
  onBorrow: (record: Omit<BorrowRecord, 'id' | 'bookId' | 'bookTitle' | 'status'>) => void;
  onClose: () => void;
}

export default function BorrowModal({ book, onBorrow, onClose }: BorrowModalProps) {
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerId, setBorrowerId] = useState('');
  const [termDays, setTermDays] = useState('14'); // Default 14 days
  const [errorMsg, setErrorMsg] = useState('');

  const borrowDateStr = new Date().toISOString().split('T')[0];
  
  // Calculate due date based on borrow term
  const getDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim()) {
      setErrorMsg("Please enter borrower's name.");
      return;
    }
    if (!borrowerId.trim()) {
      setErrorMsg("Please enter borrower's ID or contact number.");
      return;
    }

    const dueDateStr = getDueDate(parseInt(termDays) || 14);

    onBorrow({
      borrowerName: borrowerName.trim(),
      borrowerId: borrowerId.trim(),
      borrowDate: borrowDateStr,
      dueDate: dueDateStr,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700">
            <Calendar size={20} />
            <h3 className="font-semibold text-slate-800">Borrow Book Registration</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Selected Book Quick Overview */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
          <div className={`w-12 h-16 rounded-md bg-gradient-to-br ${book.coverColor} shadow-xs flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold p-1 text-center leading-tight`}>
            {book.title.slice(0, 4)}
          </div>
          <div>
            <h4 className="font-medium text-slate-800 text-sm line-clamp-1">{book.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">Author: {book.author}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">
                {book.category}
              </span>
              <span className="text-[10px] text-slate-400">
                In Stock: {book.availableCopies} left
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-sm bg-rose-50 text-rose-600 border border-rose-100 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Borrower Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Borrower's full name"
                className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Library Card ID / Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Student ID, staff ID or phone"
                className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                value={borrowerId}
                onChange={(e) => setBorrowerId(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Period</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: '7 Days', value: '7' },
                { name: '14 Days', value: '14' },
                { name: '30 Days', value: '30' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTermDays(opt.value)}
                  className={`py-2 rounded-lg border text-xs text-center transition-all ${
                    termDays === opt.value
                      ? 'border-indigo-500 bg-indigo-50/40 text-indigo-700 font-semibold ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Issued: <span className="font-semibold text-slate-600">{borrowDateStr}</span>. Due date:{' '}
              <span className="font-semibold text-indigo-600">{getDueDate(parseInt(termDays) || 14)}</span>.
            </p>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-lg text-sm font-medium shadow-xs hover:shadow-md"
            >
              Issue Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
