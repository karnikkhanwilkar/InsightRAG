import { motion } from 'framer-motion';
import { Clock, FileText, Zap, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function MetricsBar({ metrics }) {
  if (!metrics) {
    return null;
  }

  const metricsData = [
    {
      icon: Clock,
      label: 'Response Time',
      value: `${metrics.responseTime || 0}ms`,
      color: 'text-blue-400',
    },
    {
      icon: FileText,
      label: 'Chunks Retrieved',
      value: metrics.chunksCount || 0,
      color: 'text-green-400',
    },
    {
      icon: Zap,
      label: 'Tokens Used',
      value: metrics.tokensUsed || 0,
      color: 'text-yellow-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card rounded-2xl p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Metrics */}
        <div className="flex flex-wrap items-center gap-6">
          {metricsData.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 group"
            >
              <motion.div 
                className={cn('w-4 h-4', metric.color)}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <metric.icon className="w-full h-full" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{metric.label}</span>
                <span className="text-sm font-semibold text-foreground">
                  {metric.value}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          {metrics.reranker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ delay: 0.3 }}
              className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center gap-1.5 hover:bg-purple-500/30 hover:border-purple-500/50 transition-all cursor-default"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-purple-400 rounded-full"
              />
              <span className="text-xs font-medium text-purple-300">
                {metrics.reranker}
              </span>
            </motion.div>
          )}
          {metrics.llm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ delay: 0.4 }}
              className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center gap-1.5 hover:bg-blue-500/30 hover:border-blue-500/50 transition-all cursor-default"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-medium text-blue-300">{metrics.llm}</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
