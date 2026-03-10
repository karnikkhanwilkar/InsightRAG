import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import Header from './components/Header';
import IngestCard from './components/IngestCard';
import QueryBox from './components/QueryBox';
import AnswerPanel from './components/AnswerPanel';
import SourcesPanel from './components/SourcesPanel';
import MetricsBar from './components/MetricsBar';
import DocumentManager from './components/DocumentManager';
import { queryRAG } from './api/api';

function MainApp() {
  const { user, loading, profile, documents, refreshProfile } = useAuth();
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [highlightedSource, setHighlightedSource] = useState(null);
  const [warning, setWarning] = useState(null);
  const [creditsInfo, setCreditsInfo] = useState(null);
  const [selectedSources, setSelectedSources] = useState([]);
  const answerRef = useRef(null);

  // Auto-select all documents when the document list changes
  useEffect(() => {
    if (documents.length > 0) {
      setSelectedSources((prev) => {
        // Add any new documents that aren't already in the selection
        const existingSources = new Set(prev);
        const currentSources = new Set(documents.map((d) => d.source));
        
        // Keep previously selected sources that still exist, add new ones
        const updated = prev.filter((s) => currentSources.has(s));
        for (const doc of documents) {
          if (!existingSources.has(doc.source)) {
            updated.push(doc.source);
          }
        }
        return updated;
      });
    } else {
      setSelectedSources([]);
    }
  }, [documents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleQuery = async (query) => {
    setIsLoading(true);
    setError('');
    setAnswer('');
    setSources([]);
    setMetrics(null);
    setHighlightedSource(null);
    setWarning(null);
    setCreditsInfo(null);

    // Scroll to answer section
    setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const startTime = Date.now();

    try {
      // Pass selected sources as filter (null = search all)
      const sourceFilter = selectedSources.length > 0 && selectedSources.length < documents.length
        ? selectedSources
        : null;

      const response = await queryRAG(query, sourceFilter);
      const responseTime = Date.now() - startTime;

      setAnswer(response.answer || 'No answer found.');
      setSources(response.citations || []);
      setWarning(response.warning || null);
      
      // Update credits info
      if (response.credits_remaining !== undefined) {
        setCreditsInfo({
          remaining: response.credits_remaining,
          deducted: response.credits_deducted,
        });
      }
      
      // Refresh profile to get updated credits
      await refreshProfile();
      
      // Calculate metrics
      setMetrics({
        responseTime,
        chunksCount: response.citations?.length || 0,
        tokensUsed: (response.input_tokens || 0) + (response.output_tokens || 0),
        reranker: 'Cohere',
        llm: 'Gemini 2.0',
        creditsDeducted: response.credits_deducted,
      });
    } catch (err) {
      console.error('Query error:', err);
      if (err.response?.status === 403) {
        setError('No credits remaining. Credits refresh every 48 hours.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to get answer');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationClick = (citationNumber) => {
    setHighlightedSource(citationNumber);
    
    setTimeout(() => {
      const sourceElement = document.querySelector(`[data-source="${citationNumber}"]`);
      if (sourceElement) {
        const elementTop = sourceElement.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementTop - 120,
          behavior: 'smooth'
        });
      }
    }, 100);

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
              <QueryBox 
                onQuery={handleQuery} 
                isLoading={isLoading}
                creditsRemaining={profile?.credits_remaining}
                documentCount={documents.length}
                selectedCount={selectedSources.length}
              />
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

          {/* Document Manager */}
          <DocumentManager
            selectedSources={selectedSources}
            onSelectionChange={setSelectedSources}
          />

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
                warning={warning}
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
            Built without lorem ipsum
          </motion.p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
