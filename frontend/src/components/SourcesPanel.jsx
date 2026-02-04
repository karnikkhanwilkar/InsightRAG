import { motion } from 'framer-motion';
import { FileText, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SourcesPanel({ sources, highlightedSource }) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-2xl p-4 sm:p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-foreground">
          Sources <span className="text-muted-foreground">({sources.length})</span>
        </h2>
        <FileText className="w-6 h-6 text-purple-400" />
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sources.map((source, index) => (
          <motion.div
            key={index}
            data-source={index + 1}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={cn(
              'relative p-3 rounded-xl border transition-all duration-300 cursor-pointer group',
              'bg-white/5 border-white/10',
              'hover:bg-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20',
              highlightedSource === index + 1 && 'ring-2 ring-purple-500 border-purple-500 bg-purple-500/10'
            )}
          >
            {/* Citation Number Badge */}
            <div className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg">
              {index + 1}
            </div>

            {/* Source Name */}
            <div className="flex items-start gap-2 mb-3">
              <FileText className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {source.source || `Source ${index + 1}`}
                </p>
                {source.chunk_index !== undefined && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Chunk {source.chunk_index + 1}
                  </p>
                )}
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content Preview */}
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">
              {source.content}
            </p>

            {/* Relevance Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Relevance</span>
                <span className="text-purple-400 font-medium">
                  {Math.max(95 - index * 5, 70)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(95 - index * 5, 70)}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none" />
            
            {/* Enhanced Glow on Hover */}
            <motion.div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
