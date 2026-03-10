import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, CheckSquare, Square, ChevronDown, ChevronUp, FolderOpen, AlertTriangle, Loader2, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import { deleteSource } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function DocumentManager({ selectedSources, onSelectionChange }) {
  const { documents, refreshDocuments, refreshProfile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [deletingSource, setDeletingSource] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState('');

  const allSelected = documents.length > 0 && selectedSources.length === documents.length;
  const noneSelected = selectedSources.length === 0;

  const toggleSource = (source) => {
    if (selectedSources.includes(source)) {
      onSelectionChange(selectedSources.filter((s) => s !== source));
    } else {
      onSelectionChange([...selectedSources, source]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(documents.map((d) => d.source));
    }
  };

  const handleDelete = async (sourceName) => {
    setDeletingSource(sourceName);
    setError('');
    try {
      await deleteSource(sourceName);
      // Remove from selection
      onSelectionChange(selectedSources.filter((s) => s !== sourceName));
      // Refresh the document list and profile (storage)
      await Promise.all([refreshDocuments(), refreshProfile()]);
      setConfirmDelete(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete document');
    } finally {
      setDeletingSource(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (source) => {
    if (source.endsWith('.pdf')) return '📄';
    if (source.endsWith('.txt')) return '📝';
    if (source.startsWith('pasted_text')) return '📋';
    return '📁';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-semibold text-foreground">Your Documents</h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </span>
          {documents.length > 0 && !noneSelected && (
            <span className="text-xs text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded-md border border-purple-500/20">
              {selectedSources.length} active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-3 py-2 bg-destructive/20 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {documents.length === 0 ? (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <Database className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No documents uploaded yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Upload a document or paste text to get started
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Select All / None */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pb-1 border-b border-white/5">
                    <button
                      onClick={toggleAll}
                      className="flex items-center gap-2 hover:text-foreground transition-colors py-1"
                    >
                      {allSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                      <span>{allSelected ? 'Deselect all' : 'Select all'}</span>
                    </button>
                    {noneSelected && documents.length > 0 && (
                      <span className="text-yellow-400 text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        No docs selected — queries will search all
                      </span>
                    )}
                  </div>

                  {/* Document List */}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                    {documents.map((doc, index) => (
                      <motion.div
                        key={doc.source}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                          selectedSources.includes(doc.source)
                            ? 'bg-purple-500/10 border border-purple-500/20'
                            : 'bg-white/5 border border-white/5 hover:border-white/10'
                        )}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleSource(doc.source)}
                          className="flex-shrink-0"
                        >
                          {selectedSources.includes(doc.source) ? (
                            <CheckSquare className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                          )}
                        </button>

                        {/* File Icon */}
                        <span className="text-base flex-shrink-0">{getFileIcon(doc.source)}</span>

                        {/* Document Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {doc.source}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{doc.chunk_count} chunks</span>
                            <span>•</span>
                            <span>{formatDate(doc.created_at)}</span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        {confirmDelete === doc.source ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(doc.source)}
                              disabled={deletingSource === doc.source}
                              className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deletingSource === doc.source ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                'Yes'
                              )}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 text-muted-foreground rounded-lg transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(doc.source);
                            }}
                            className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
