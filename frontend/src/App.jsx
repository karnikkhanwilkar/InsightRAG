import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import IngestCard from './components/IngestCard';
import QueryBox from './components/QueryBox';
import AnswerPanel from './components/AnswerPanel';
import SourcesPanel from './components/SourcesPanel';
import MetricsBar from './components/MetricsBar';
import { queryRAG } from './api/api';

function App() {
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [highlightedSource, setHighlightedSource] = useState(null);
  const answerRef = useRef(null);

  const handleQuery = async (query) => {
    setIsLoading(true);
    setError('');
    setAnswer('');
    setSources([]);
    setMetrics(null);
    setHighlightedSource(null);

    // Scroll to answer section
    setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const startTime = Date.now();

    try {
      const response = await queryRAG(query);
      const responseTime = Date.now() - startTime;

      setAnswer(response.answer || 'No answer found.');
      setSources(response.citations || []);
      
      // Calculate metrics
      setMetrics({
        responseTime,
        chunksCount: response.citations?.length || 0,
        tokensUsed: (response.input_tokens || 0) + (response.output_tokens || 0),
        reranker: 'Cohere',
        llm: 'Gemini 2.0',
      });
    } catch (err) {
      console.error('Query error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationClick = (citationNumber) => {
    setHighlightedSource(citationNumber);
    
    // Scroll to source
    setTimeout(() => {
      const sourceElement = document.querySelector(`[data-source="${citationNumber}"]`);
      if (sourceElement) {
        // Get the position of the element
        const elementTop = sourceElement.getBoundingClientRect().top + window.pageYOffset;
        // Scroll to position with offset for header
        window.scrollTo({
          top: elementTop - 120,
          behavior: 'smooth'
        });
      }
    }, 100);

    // Clear highlight after 2 seconds
    setTimeout(() => {
      setHighlightedSource(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
          {/* Input Section - Three Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 lg:items-stretch">
            <div className="h-full">
              <IngestCard />
            </div>
            
            <div className="h-full">
              <QueryBox onQuery={handleQuery} isLoading={isLoading} />
            </div>
            
            {/* Sources + Metrics Column */}
            <div className="h-full space-y-4 lg:space-y-6">
              {/* Sources Panel */}
              {sources.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="h-full"
                >
                  <SourcesPanel sources={sources} highlightedSource={highlightedSource} />
                </motion.div>
              ) : (
                <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground text-center">
                    Sources will appear here after querying
                  </p>
                </div>
              )}
              
              {/* Metrics Bar beneath Sources */}
              {metrics && (
                <MetricsBar metrics={metrics} />
              )}
            </div>
          </div>

          {/* Answer Section - Full Width */}
          {(answer || isLoading || error) && (
            <motion.div
              ref={answerRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnswerPanel
                answer={answer}
                isLoading={isLoading}
                error={error}
                onCitationClick={handleCitationClick}
              />
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-muted-foreground border-t border-white/5">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Built with ❤️ using React • Tailwind • Framer Motion
          </motion.p>
        </footer>
      </div>
    </div>
  );
}

export default App;
