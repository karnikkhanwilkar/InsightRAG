import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Command } from 'lucide-react';
import { cn } from '../lib/utils';

export default function QueryBox({ onQuery, isLoading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onQuery(query.trim());
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card glass-card-hover rounded-2xl p-4 h-full flex flex-col"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Ask a Question</h2>
          <Search className="w-4 h-4 text-purple-400" />
        </div>

        {/* Input Field */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask something from your documents..."
            disabled={isLoading}
            className={cn(
              'w-full pl-10 pr-10 py-3 text-sm bg-white/5 border border-white/10 rounded-xl',
              'text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
              'focus:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
              'transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Keyboard Hint */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Press to search</span>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-white/10">
            <Command className="w-3 h-3" />
            <span>+</span>
            <span>Enter</span>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 20px 25px -5px rgba(168, 85, 247, 0.4)',
            background: 'linear-gradient(to right, rgb(147, 51, 234), rgb(219, 39, 119))'
          }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!query.trim() || isLoading}
          className={cn(
            'w-full py-2 px-4 text-sm rounded-xl font-medium transition-all duration-300',
            'bg-gradient-to-r from-purple-600 to-pink-600',
            'text-white shadow-lg shadow-purple-500/30',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg',
            'flex items-center justify-center gap-2',
            'relative overflow-hidden group'
          )}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"
          />
          <Sparkles className="w-4 h-4 relative z-10" />
          <span className="relative z-10">{isLoading ? 'Thinking...' : 'Ask AI'}</span>
        </motion.button>
      </form>
    </motion.div>
  );
}
