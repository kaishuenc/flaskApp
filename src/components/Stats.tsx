import { Book, BorrowRecord } from '../types';
import { BookOpen, Bookmark, AlertCircle, CheckCircle } from 'lucide-react';

interface StatsProps {
  books: Book[];
  records: BorrowRecord[];
}

export default function Stats({ books, records }: StatsProps) {
  const totalBooks = books.reduce((acc, book) => acc + book.totalCopies, 0);
  const uniqueTitles = books.length;
  
  const activeBorrows = records.filter(r => r.status === 'borrowed').length;
  const overdueBorrows = records.filter(r => r.status === 'overdue').length;
  const returnedCount = records.filter(r => r.status === 'returned').length;

  const stats = [
    {
      label: 'Total Catalog Copies',
      value: totalBooks,
      subtext: `${uniqueTitles} unique titles registered`,
      icon: BookOpen,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Currently Borrowed',
      value: activeBorrows + overdueBorrows,
      subtext: `Normal: ${activeBorrows} copies`,
      icon: Bookmark,
      iconColor: 'text-sky-600 bg-sky-50 border-sky-100',
    },
    {
      label: 'Overdue Books',
      value: overdueBorrows,
      subtext: 'Requires immediate attention',
      icon: AlertCircle,
      iconColor: overdueBorrows > 0 ? 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse' : 'text-slate-400 bg-slate-50 border-slate-100',
    },
    {
      label: 'Total Returns',
      value: returnedCount,
      subtext: 'Transaction system active',
      icon: CheckCircle,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-semibold text-slate-800 tracking-tight">{stat.value}</h3>
              <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
            </div>
            <div className={`p-3 rounded-xl border ${stat.iconColor} flex items-center justify-center`}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
