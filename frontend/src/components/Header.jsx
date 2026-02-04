import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative py-4 sm:py-5 px-4 sm:px-6"
    >
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Logo/Name with glow */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-2"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] leading-tight pb-1">
            InsightRAG
          </h1>
        </motion.div>

        {/* Value Proposition */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xs sm:text-sm lg:text-base text-muted-foreground max-w-3xl mx-auto"
        >
          Ask questions. Get grounded answers with citations.
        </motion.p>

        {/* Subtle indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground/70"
        >
          <span>Powered by</span>
          <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-md">Gemini</span>
          <span>•</span>
          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md">Supabase</span>
          <span>•</span>
          <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 rounded-md">Cohere</span>
        </motion.div>

        {/* RAG Flow Hint */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground/50"
        >
          <span className="px-2 py-1 bg-white/5 rounded">Upload</span>
          <ArrowRight className="w-3 h-3" />
          <span className="px-2 py-1 bg-white/5 rounded">Retrieve</span>
          <ArrowRight className="w-3 h-3" />
          <span className="px-2 py-1 bg-white/5 rounded">Rerank</span>
          <ArrowRight className="w-3 h-3" />
          <span className="px-2 py-1 bg-white/5 rounded">Answer</span>
        </motion.div>
      </div>
    </motion.header>
  );
}
