import React, { useState } from 'react';
import { Book } from '../types';
import { CATEGORIES } from '../data';
import { X, BookOpen } from 'lucide-react';

interface AddBookModalProps {
  onAdd: (book: Book) => void;
  onClose: () => void;
}

const COVER_OPTIONS = [
  { name: 'Classic Blue', className: 'from-blue-600 to-cyan-700' },
  { name: 'Emerald Forest', className: 'from-emerald-600 to-teal-700' },
  { name: 'Amber Gold', className: 'from-amber-600 to-amber-800' },
  { name: 'Elegant Rose', className: 'from-rose-600 to-pink-700' },
  { name: 'Deep Purple', className: 'from-violet-600 to-purple-800' },
  { name: 'Obisidian Black', className: 'from-neutral-800 to-neutral-600' },
];

export default function AddBookModal({ onAdd, onClose }: AddBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isbn, setIsbn] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);
  const [coverColor, setCoverColor] = useState(COVER_OPTIONS[0].className);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !isbn.trim()) {
      setErrorMsg('Please complete all required fields (Title, Author, ISBN).');
      return;
    }
    if (totalCopies <= 0) {
      setErrorMsg('Total copies must be greater than 0.');
      return;
    }

    const newBook: Book = {
      id: 'book-' + Date.now(),
      title: title.trim(),
      author: author.trim(),
      category,
      isbn: isbn.trim(),
      totalCopies,
      availableCopies: totalCopies,
      coverColor,
      addedDate: new Date().toISOString().split('T')[0],
    };

    onAdd(newBook);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={20} />
            <h3 className="font-semibold text-slate-800">Add New Book to Catalog</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg">
            <X size={20} />
          </button>
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
              Book Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter full book title"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Author / Translator <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Thomas Cormen"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ISBN Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 978-7-..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stock (Total Copies) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                value={totalCopies}
                onChange={(e) => setTotalCopies(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          </div>

          {/* Book Cover Color Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Visual Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {COVER_OPTIONS.map((opt) => (
                <button
                  key={opt.className}
                  type="button"
                  onClick={() => setCoverColor(opt.className)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-all ${
                    coverColor === opt.className
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-xs bg-gradient-to-br ${opt.className} shadow-xs inline-block shrink-0`} />
                  <span className="truncate text-slate-700 font-medium">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
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
              Register & Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
