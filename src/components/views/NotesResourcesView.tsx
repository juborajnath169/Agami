import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Plus,
  Search,
  Star,
  ExternalLink,
  Youtube,
  Folder,
  Trash2,
  X,
  Tag,
  BookOpen,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { NoteItem, ResourceLink, ResourceType } from '../../types';

export const NotesResourcesView: React.FC = () => {
  const {
    notes,
    subjects,
    chapters,
    settings,
    t,
    formatNumber,
    addNote,
    deleteNote,
    toggleFavoriteNote
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Note Modal state
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [chapterId, setChapterId] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('youtube');
  const [resourceList, setResourceList] = useState<ResourceLink[]>([]);

  const handleAddResourceItem = () => {
    if (!resourceTitle.trim() || !resourceUrl.trim()) return;
    setResourceList(prev => [
      ...prev,
      {
        id: `res_${Date.now()}`,
        title: resourceTitle.trim(),
        url: resourceUrl.trim(),
        type: resourceType
      }
    ]);
    setResourceTitle('');
    setResourceUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setResourceList(prev => [
        ...prev,
        {
          id: `res_${Date.now()}`,
          title: file.name,
          url: base64,
          type: 'pdf',
          fileData: base64
        }
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    addNote({
      title: title.trim(),
      subjectId: subjectId || undefined,
      chapterId: chapterId || undefined,
      content: content.trim(),
      resources: resourceList,
      isFavorite: false,
      tags
    });

    // Reset
    setTitle('');
    setContent('');
    setTagsInput('');
    setResourceList([]);
    setIsModalOpen(false);
  };

  // Filter notes
  const filteredNotes = notes.filter(n => {
    if (favoritesOnly && !n.isFavorite) return false;
    if (selectedSubjectId !== 'all' && n.subjectId !== selectedSubjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTag = n.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            <span>{t('notesAndResources')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Formulas, summaries, YouTube video lectures, Google Drive PDFs, and web bookmarks.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newNote')}</span>
        </button>
      </div>

      {/* Search & Subject Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('searchNotes')}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              favoritesOnly
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-current' : ''}`} />
            <span>{t('favoritesOnly')}</span>
          </button>

          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">{t('allSubjects')}</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {settings.language === 'bn' ? s.nameBn : s.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-2 text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('noNotesFound')}</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition"
            >
              + {t('newNote')}
            </button>
          </div>
        ) : (
          filteredNotes.map(note => {
            const subject = subjects.find(s => s.id === note.subjectId);
            return (
              <div
                key={note.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {subject && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60">
                          {settings.language === 'bn' ? subject.nameBn : subject.nameEn}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavoriteNote(note.id)}
                        className={`p-1.5 rounded-lg transition ${
                          note.isFavorite ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-slate-500'
                        }`}
                        title={t('favorite')}
                      >
                        <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-6 mb-4 font-mono bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {note.content}
                  </p>

                  {/* Resource Links / Attachments */}
                  {note.resources && note.resources.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Attached Resources:
                      </span>
                      {note.resources.map(res => (
                        <a
                          key={res.id}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {res.type === 'youtube' && <Youtube className="w-4 h-4 text-rose-500 shrink-0" />}
                            {res.type === 'drive' && <Folder className="w-4 h-4 text-blue-500 shrink-0" />}
                            {res.type === 'pdf' && <FileText className="w-4 h-4 text-amber-500 shrink-0" />}
                            {res.type === 'web' && <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />}
                            <span className="truncate font-medium">{res.title}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 text-[10px] text-slate-400">
                  Updated: {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t('newNote')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="mt-4 space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('noteTitle')} *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Organic Chemistry Name Reactions"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('subject')}</label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white text-xs"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('tags')}</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="Formulas, Revision, HSC"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('noteContent')} *</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write formulas, points, summary..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              {/* Resource Link & File Adder */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Attach Online Links or PDF
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Link Title (e.g. YouTube Lecture)"
                    value={resourceTitle}
                    onChange={e => setResourceTitle(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                  <select
                    value={resourceType}
                    onChange={e => setResourceType(e.target.value as ResourceType)}
                    className="px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="drive">Drive</option>
                    <option value="web">Web</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="URL (https://...)"
                    value={resourceUrl}
                    onChange={e => setResourceUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddResourceItem}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Or upload local PDF/document file</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {resourceList.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {resourceList.map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white dark:bg-slate-800 border">
                        <span className="truncate">{r.title} ({r.type})</span>
                        <button
                          type="button"
                          onClick={() => setResourceList(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-rose-500 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition"
                >
                  {t('submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
