import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2, AlertCircle, Quote, Search, Zap, Brain, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AnswerPanel({ answer, isLoading, error, onCitationClick, warning }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);

  // Debug log
  useEffect(() => {
    console.log('AnswerPanel - warning prop:', warning);
  }, [warning]);

  // Thinking steps animation
  useEffect(() => {
    if (isLoading) {
      const steps = ['Retrieving', 'Reranking', 'Answering'];
      let currentStep = 0;
      const stepInterval = setInterval(() => {
        setThinkingStep(currentStep % steps.length);
        currentStep++;
      }, 1200);
      return () => clearInterval(stepInterval);
    }
  }, [isLoading]);

  useEffect(() => {
    if (answer && !isLoading) {
      setIsTyping(true);
      setDisplayedText('');
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex <= answer.length) {
          setDisplayedText(answer.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
        }
      }, 10);

      return () => clearInterval(typingInterval);
    } else if (!answer) {
      setDisplayedText('');
    }
  }, [answer, isLoading]);

  const renderAnswerWithCitations = (text) => {
    // Remove extra asterisks (markdown bold formatting)
    let cleanedText = text.replace(/\*\*/g, '');
    
    // Split text into paragraphs
    const paragraphs = cleanedText.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, pIndex) => {
      // Match citations like [1], [2], etc.
      const citationRegex = /\[(\d+)\]/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = citationRegex.exec(paragraph)) !== null) {
        // Add text before citation
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            content: paragraph.slice(lastIndex, match.index),
          });
        }

        // Add citation
        parts.push({
          type: 'citation',
          content: match[1],
          fullMatch: match[0],
        });

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < paragraph.length) {
        parts.push({
          type: 'text',
          content: paragraph.slice(lastIndex),
        });
      }

      return (
        <p key={pIndex} className="mb-4 last:mb-0 leading-relaxed">
          {parts.map((part, index) => {
            if (part.type === 'citation') {
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onCitationClick?.(parseInt(part.content))}
                  className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer mx-0.5"
                >
                  {part.content}
                </motion.button>
              );
            }
            return <span key={index}>{part.content}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl p-6 sm:p-8 min-h-[400px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-foreground">Answer</h2>
        <MessageSquare className="w-6 h-6 text-purple-400" />
      </div>

      {/* Warning Banner */}
      <AnimatePresence>
        {warning && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200 leading-relaxed">{warning}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Thinking Steps Animation */}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ 
                    scale: thinkingStep === 0 ? [1, 1.2, 1] : 1,
                    opacity: thinkingStep === 0 ? 1 : 0.3
                  }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <Search className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-xs text-muted-foreground">Retrieving</span>
                </motion.div>

                <motion.div
                  animate={{ opacity: thinkingStep >= 1 ? 1 : 0.2 }}
                  className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                />

                <motion.div
                  animate={{ 
                    scale: thinkingStep === 1 ? [1, 1.2, 1] : 1,
                    opacity: thinkingStep === 1 ? 1 : thinkingStep > 1 ? 0.7 : 0.3
                  }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-pink-500/20 rounded-full">
                    <Zap className="w-6 h-6 text-pink-400" />
                  </div>
                  <span className="text-xs text-muted-foreground">Reranking</span>
                </motion.div>

                <motion.div
                  animate={{ opacity: thinkingStep >= 2 ? 1 : 0.2 }}
                  className="w-8 h-0.5 bg-gradient-to-r from-pink-500 to-blue-500"
                />

                <motion.div
                  animate={{ 
                    scale: thinkingStep === 2 ? [1, 1.2, 1] : 1,
                    opacity: thinkingStep === 2 ? 1 : 0.3
                  }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs text-muted-foreground">Answering</span>
                </motion.div>
              </div>
              <p className="text-sm text-muted-foreground">Analyzing documents...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 text-center max-w-md"
            >
              <div className="p-4 bg-destructive/20 rounded-full">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <div>
                <p className="text-foreground font-medium mb-2 text-lg">Something went wrong</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </motion.div>
          ) : displayedText ? (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              <div className="prose prose-invert prose-lg max-w-none">
                <div className="text-foreground text-base">
                  {renderAnswerWithCitations(displayedText)}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-5 bg-purple-400 ml-1"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="p-4 bg-purple-500/10 rounded-full">
                <Quote className="w-10 h-10 text-purple-400" />
              </div>
              <div>
                <p className="text-foreground font-medium mb-2 text-lg">Ready to answer</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Ask a question about your indexed documents to get started
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
