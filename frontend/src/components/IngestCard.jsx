import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, Loader2, X, Copy, Database, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { ingestDocument } from '../api/api';

export default function IngestCard() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [chunksCount, setChunksCount] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'text/plain')) {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a PDF or TXT file');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleIngest = async () => {
    if (!file && !text.trim()) {
      setError('Please upload a file or paste some text');
      return;
    }

    setIsLoading(true);
    setError('');
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await ingestDocument(file, text.trim() || null);
      setProgress(100);
      setIsSuccess(true);
      setChunksCount(result.chunks_created || result.chunks_indexed || 0);
      setTimeout(() => {
        setIsSuccess(false);
        setFile(null);
        setText('');
        setProgress(0);
      }, 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to ingest document');
      setProgress(0);
    } finally {
      setIsLoading(false);
      clearInterval(progressInterval);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCharCount = () => {
    if (file) return `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (text) return `${text.length} characters`;
    return '0 characters';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card glass-card-hover rounded-2xl p-4 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Document Ingestion</h2>
        <FileText className="w-4 h-4 text-purple-400" />
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-5 transition-all duration-300 cursor-pointer overflow-hidden',
          isDragging
            ? 'border-purple-500 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
        )}
      >
        {/* Glow effect on drag */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 pointer-events-none"
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2 text-center">
          {file ? (
            <>
              <div className="relative">
                <FileText className="w-10 h-10 text-purple-400" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop your PDF or TXT file here
                </p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* OR Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">OR</span>
        </div>
      </div>

      {/* Text Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Paste text directly</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here..."
          rows={3}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{getCharCount()}</span>
          {text && (
            <button
              onClick={() => setText('')}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Indexing document... {progress}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-2 bg-destructive/20 border border-destructive/30 rounded-lg text-sm text-destructive"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Index Button */}
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(168, 85, 247, 0.4)' }}
        whileTap={{ scale: 0.98 }}
        onClick={handleIngest}
        disabled={isLoading || isSuccess}
        className={cn(
          'w-full py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300',
          'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500',
          'text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg',
          'flex items-center justify-center gap-2'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Indexing...
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Indexed Successfully
          </>
        ) : (
          'Index Document'
        )}
      </motion.button>

      {/* Success Metadata */}
      <AnimatePresence>
        {isSuccess && chunksCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2"
          >
            <div className="flex items-center gap-2 text-green-400">
              <Database className="w-4 h-4" />
              <span>{chunksCount} chunks indexed</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span>Google \u2022 Supabase</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
