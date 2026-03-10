import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, LogOut, User, Coins, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const creditsPercent = profile ? (profile.credits_remaining / 5.0) * 100 : 0;
  const creditsColor = creditsPercent > 50 ? 'text-green-400' : creditsPercent > 20 ? 'text-yellow-400' : 'text-red-400';
  const creditsBarColor = creditsPercent > 50 ? 'from-green-500 to-emerald-500' : creditsPercent > 20 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-500';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative py-4 sm:py-5 px-4 sm:px-6"
    >
      <div className="relative z-10 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] leading-tight pb-1">
              InsightRAG
            </h1>
          </motion.div>

          {/* Center - Flow Hint (Desktop only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground/50"
          >
            <span className="px-2 py-1 bg-white/5 rounded">Upload</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-1 bg-white/5 rounded">Retrieve</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-1 bg-white/5 rounded">Rerank</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-1 bg-white/5 rounded">Answer</span>
          </motion.div>

          {/* Right - User Info & Credits */}
          {user && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              {/* Credits Badge */}
              {profile && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 glass-card rounded-xl"
                >
                  <Coins className={cn('w-4 h-4', creditsColor)} />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground leading-none">Credits</span>
                    <span className={cn('text-sm font-bold leading-tight', creditsColor)}>
                      {profile.credits_remaining.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${creditsPercent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={cn('h-full rounded-full bg-gradient-to-r', creditsBarColor)}
                    />
                  </div>
                </motion.div>
              )}

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-3 py-2 glass-card glass-card-hover rounded-xl cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-xs text-foreground max-w-[120px] truncate">
                    {user.email}
                  </span>
                  <ChevronDown className={cn(
                    'w-3 h-3 text-muted-foreground transition-transform',
                    showMenu && 'rotate-180'
                  )} />
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {showMenu && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 glass-card rounded-xl p-3 z-50 shadow-2xl shadow-black/50"
                      >
                        {/* User Info */}
                        <div className="px-2 py-2 border-b border-white/10 mb-2">
                          <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Signed in</p>
                        </div>

                        {/* Credits info in dropdown (mobile) */}
                        {profile && (
                          <div className="px-2 py-2 border-b border-white/10 mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Credits</span>
                              <span className={cn('text-sm font-bold', creditsColor)}>
                                {profile.credits_remaining.toFixed(2)} / 5.00
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', creditsBarColor)}
                                style={{ width: `${creditsPercent}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              Refreshes every 48 hours
                            </p>
                          </div>
                        )}

                        {/* Storage info */}
                        {profile && (
                          <div className="px-2 py-2 border-b border-white/10 mb-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Storage</span>
                              <span className="text-xs text-foreground">
                                {(profile.storage_used_bytes / 1024).toFixed(1)} KB / {(profile.max_storage_bytes / (1024 * 1024)).toFixed(0)} MB
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Sign Out */}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* Powered by badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground/70"
        >
          <span>Powered by</span>
          <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-md">Gemini</span>
          <span>•</span>
          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md">Supabase</span>
          <span>•</span>
          <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 rounded-md">Cohere</span>
        </motion.div>
      </div>
    </motion.header>
  );
}
