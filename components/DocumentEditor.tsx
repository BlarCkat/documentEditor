'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  FileText, Trash2, Download, Bold, Italic, Underline, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, Plus, X, MoreHorizontal, Star, 
  Folder, Users, Menu, Calendar as CalendarIcon, Eye, Copy, Mail, 
  Printer, Settings, Globe, Clock, Info, Shield, Edit3, Save, 
  Undo2, Redo2, Search, Type, FileCode, FileJson, FileInput, 
  Upload, Share2, Zap, Tag, Bookmark, History, AlertCircle,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Grid, 
  Columns, Rows, Layout, Palette, Image, Link, Table, 
  Code, Moon, Sun, Check, Filter, SortAsc, SortDesc,
  PieChart, BarChart, LineChart, TrendingUp, Bell, Heart,
  MessageSquare, ThumbsUp, Award, Target, Rocket, Coffee,
  Scissors,
  ClipboardPaste
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import debounce from 'lodash/debounce';

// ==================== UTILITY FUNCTION ====================
const getRelativeTime = (timestamp: number | undefined): string => {
  if (!timestamp) return 'never';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'never';
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  } catch {
    return 'never';
  }
};

// ==================== TYPES ====================
type DocumentStatus = 'draft' | 'scheduled' | 'published' | 'archived';
type PlatformType = 'linkedin' | 'instagram' | 'twitter' | 'facebook' | 'tiktok' | 'youtube';
type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
type ViewMode = 'page' | 'calendar' | 'kanban' | 'list';
type TemplateCategory = 'social' | 'marketing' | 'content' | 'planning' | 'business' | 'academic';
type DarkMode = 'light' | 'dark' | 'night' | 'system';
type DocumentType = 'document' | 'video_script' | 'carousel' | 'social_post' | 'blog' | 'email';

interface Document {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  scheduledDate?: string;
  status: DocumentStatus;
  lastModified: number;
  tags: string[];
  author: string;
  wordCount: number;
  characterCount: number;
  version: number;
  isFavorite: boolean;
  isPinned: boolean;
  color?: string;
  icon?: string;
  documentType: DocumentType;
  carouselSlides?: CarouselSlide[];
  collaborators?: string[];
  shareLink?: string;
}

interface CarouselSlide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  order: number;
}

interface DocumentVersion {
  id: string;
  timestamp: number;
  content: string;
  title: string;
  author: string;
  changes?: string;
}

interface CustomTemplate {
  id: string;
  name: string;
  content: string;
  description?: string;
  category: TemplateCategory;
  icon: string;
  isFavorite: boolean;
  usageCount: number;
  lastUsed?: number;
  tags: string[];
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  lastActive?: number;
}

interface EditorState {
  history: string[];
  historyIndex: number;
  isCollaborating: boolean;
  autoSave: boolean;
  darkMode: DarkMode;
  showFormatting: boolean;
  showWordCount: boolean;
  lineHeight: number;
  editorFont: string;
}

// ==================== TEMPLATES ====================
const templates = {
  social_post: { 
    title: 'Social Media Post', 
    content: '<h2>Social Media Post</h2><p><strong>Platform:</strong> </p><p><strong>Caption:</strong></p><p></p><p><strong>Hashtags:</strong></p><p></p><p><strong>Call to Action:</strong></p><p></p>',
    category: 'social' as TemplateCategory,
    icon: 'MessageSquare',
    type: 'social_post' as DocumentType
  },
  carousel_linkedin: { 
    title: 'LinkedIn Carousel', 
    content: '<h2>LinkedIn Carousel Post</h2><p><strong>Slide 1 Title:</strong></p><p><strong>Slide 1 Content:</strong></p><p></p><p><strong>Slide 2 Title:</strong></p><p><strong>Slide 2 Content:</strong></p><p></p><p><strong>Slide 3 Title:</strong></p><p><strong>Slide 3 Content:</strong></p>',
    category: 'social' as TemplateCategory,
    icon: 'Layers',
    type: 'carousel' as DocumentType
  },
  carousel_instagram: { 
    title: 'Instagram Carousel', 
    content: '<h2>Instagram Carousel Post</h2><p><strong>Caption:</strong></p><p></p><p><strong>Slide 1:</strong></p><p><strong>Description:</strong></p><p></p><p><strong>Slide 2:</strong></p><p><strong>Description:</strong></p><p></p><p><strong>Slide 3:</strong></p><p><strong>Description:</strong></p>',
    category: 'social' as TemplateCategory,
    icon: 'Images',
    type: 'carousel' as DocumentType
  },
  video_script: { 
    title: 'Video Script', 
    content: '<h2>Video Script</h2><p><strong>Video Title:</strong></p><p><strong>Duration:</strong></p><p><strong>Target Platform:</strong></p><p><strong>Hook (0-5s):</strong></p><p></p><p><strong>Introduction (5-30s):</strong></p><p></p><p><strong>Main Content (30s-2min):</strong></p><p></p><p><strong>Call to Action (Final 10s):</strong></p><p></p>',
    category: 'content' as TemplateCategory,
    icon: 'Video',
    type: 'video_script' as DocumentType
  },
  youtube_script: { 
    title: 'YouTube Video Script', 
    content: '<h2>YouTube Video Script</h2><p><strong>Title:</strong></p><p><strong>Description:</strong></p><p><strong>Target Audience:</strong></p><p><strong>SEO Keywords:</strong></p><h3>Hook (First 10 Seconds)</h3><p></p><h3>Intro (10-30 seconds)</h3><p></p><h3>Main Content</h3><p></p><h3>Outro & CTA (Last 15 seconds)</h3><p></p>',
    category: 'content' as TemplateCategory,
    icon: 'PlayCircle',
    type: 'video_script' as DocumentType
  },
  tiktok_script: { 
    title: 'TikTok Script', 
    content: '<h2>TikTok Script</h2><p><strong>Trend/Sound:</strong></p><p><strong>Hook (First 2 seconds):</strong></p><p></p><p><strong>Body (2-30 seconds):</strong></p><p></p><p><strong>Outro & CTA (Last 3 seconds):</strong></p><p></p><p><strong>Audio:</strong></p><p><strong>Effects/Transitions:</strong></p><p></p>',
    category: 'content' as TemplateCategory,
    icon: 'Music',
    type: 'video_script' as DocumentType
  },
  blog_article: { 
    title: 'Blog Article', 
    content: '<h1>Article Title</h1><p><strong>Meta Description:</strong> </p><p><strong>Target Keywords:</strong> </p><h2>Introduction</h2><p></p><h2>Main Points</h2><ul><li></li><li></li><li></li></ul><h2>Conclusion</h2><p></p>',
    category: 'content' as TemplateCategory,
    icon: 'FileText',
    type: 'blog' as DocumentType
  },
  email_campaign: { 
    title: 'Email Campaign', 
    content: '<h2>Email Campaign</h2><p><strong>Subject Line:</strong> </p><p><strong>Preview Text:</strong> </p><p><strong>Greeting:</strong></p><p></p><p><strong>Body:</strong></p><p></p><p><strong>CTA Button:</strong></p><p></p>',
    category: 'marketing' as TemplateCategory,
    icon: 'Mail',
    type: 'email' as DocumentType
  },
  newsletter: {
    title: 'Newsletter',
    content: '<h1>Newsletter Title</h1><p><strong>Issue:</strong> </p><p><strong>Date:</strong> </p><h2>Top Story</h2><p></p><h2>Updates</h2><ul><li></li><li></li></ul><h2>Upcoming Events</h2><p></p>',
    category: 'marketing' as TemplateCategory,
    icon: 'Send',
    type: 'email' as DocumentType
  },
  business_proposal: {
    title: 'Business Proposal',
    content: '<h1>Business Proposal</h1><h2>Executive Summary</h2><p></p><h2>Problem Statement</h2><p></p><h2>Solution</h2><p></p><h2>Budget & Timeline</h2><p></p><h2>Conclusion</h2><p></p>',
    category: 'business' as TemplateCategory,
    icon: 'Briefcase',
    type: 'document' as DocumentType
  },
  meeting_notes: {
    title: 'Meeting Notes',
    content: '<h2>Meeting Notes</h2><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p><h3>Agenda</h3><ul><li></li><li></li></ul><h3>Discussion Points</h3><p></p><h3>Action Items</h3><ul><li></li><li></li></ul>',
    category: 'business' as TemplateCategory,
    icon: 'Users',
    type: 'document' as DocumentType
  }
};

const templateCategories = {
  social: ['social_post', 'carousel_linkedin', 'carousel_instagram'],
  marketing: ['email_campaign', 'newsletter'],
  content: ['blog_article', 'video_script', 'youtube_script', 'tiktok_script'],
  planning: [],
  business: ['business_proposal', 'meeting_notes']
};

// ==================== MAIN COMPONENT ====================
export default function DocumentEditor() {
  // ==================== STATE ====================
  const [documents, setDocuments] = useState<Document[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [documentVersions, setDocumentVersions] = useState<Record<string, DocumentVersion[]>>({});
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState<PlatformType>('linkedin');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leftMargin, setLeftMargin] = useState(72);
  const [rightMargin, setRightMargin] = useState(72);
  const [activeView, setActiveView] = useState<ViewMode>('page');
  const [showDayView, setShowDayView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggingOver, setDraggingOver] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'modified'>('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [cursorPositions, setCursorPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    history: [],
    historyIndex: -1,
    isCollaborating: false,
    autoSave: true,
    darkMode: 'system',
    showFormatting: true,
    showWordCount: true,
    lineHeight: 1.6,
    editorFont: 'Inter'
  });
  const [exportFormat, setExportFormat] = useState<'txt' | 'md' | 'pdf' | 'html' | 'json'>('md');
  const [wordGoal, setWordGoal] = useState(1000);
  const [readingTime, setReadingTime] = useState(0);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  
  const activeDoc = documents.find(d => d.id === activeDocId);

  // ==================== EFFECTS ====================
  useEffect(() => {
    const saved = localStorage.getItem('all_documents');
    const savedTemplates = localStorage.getItem('custom_templates');
    const savedSettings = localStorage.getItem('editor_settings');
    
    if (saved) {
      try {
        const docs = JSON.parse(saved);
        setDocuments(docs);
        if (docs.length > 0) {
          setActiveDocId(docs[0].id);
        } else {
          createNewDocument();
        }
      } catch (err) {
        setError('Failed to load documents');
        createNewDocument();
      }
    } else {
      createNewDocument();
    }
    
    if (savedTemplates) {
      try {
        setCustomTemplates(JSON.parse(savedTemplates));
      } catch (err) {
        setError('Failed to load templates');
      }
    }
    
    if (savedSettings) {
      try {
        setEditorState(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      } catch (err) {
        console.error('Failed to load settings');
      }
    }
    
    // Check screen size for responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-save with debounce
  const debouncedSave = useMemo(
    () => debounce(() => saveDocuments(), 1000),
    []
  );

  useEffect(() => {
    if (activeDoc && editorState.autoSave) {
      debouncedSave();
    }
    return () => debouncedSave.cancel();
  }, [activeDoc?.content, activeDoc?.title, activeDoc?.scheduledDate, debouncedSave]);

  // Update word count and reading time
  useEffect(() => {
    if (activeDoc) {
      const plainText = getPlainText(activeDoc.content);
      const words = plainText.split(/\s+/).filter(w => w.length > 0).length;
      const chars = plainText.length;
      const readingTimeMinutes = Math.ceil(words / 200);
      
      updateDocument(activeDocId, { 
        wordCount: words, 
        characterCount: chars,
        lastModified: Date.now()
      });
      
      setReadingTime(readingTimeMinutes);
      
      // Save to history for undo/redo
      saveToHistory(activeDoc.content);
    }
  }, [activeDoc?.content]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab to switch views
      if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && !activeElement?.hasAttribute('contenteditable')) {
          e.preventDefault();
          setActiveView(prev => {
            const views: ViewMode[] = ['page', 'calendar', 'list', 'kanban'];
            const currentIndex = views.indexOf(prev);
            return views[(currentIndex + 1) % views.length];
          });
        }
      }
      
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDocuments();
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 500);
      }
      
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
      }
      
      // Ctrl/Cmd + B for bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        executeCommand('bold');
      }
      
      // Ctrl/Cmd + I for italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        executeCommand('italic');
      }
      
      // Ctrl/Cmd + U for underline
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        executeCommand('underline');
      }
      
      // Ctrl/Cmd + K for link
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const url = prompt('Enter URL:');
        if (url) executeCommand('createLink', url);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorState.history, editorState.historyIndex]);

  // ==================== DOCUMENT FUNCTIONS ====================
  const createNewDocument = (initialDate?: string, template?: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title: 'Untitled Document',
      content: template || '',
      timestamp: Date.now(),
      status: 'draft',
      scheduledDate: initialDate || undefined,
      lastModified: Date.now(),
      tags: [],
      author: 'You',
      wordCount: 0,
      characterCount: 0,
      version: 1,
      isFavorite: false,
      isPinned: false,
      color: '#3b82f6',
      icon: 'FileText',
      documentType: 'document'
    };
    
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
    saveToHistory(template || '');
    return newDoc;
  };

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    try {
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? { 
          ...doc, 
          ...updates, 
          version: updates.content ? doc.version + 1 : doc.version,
          lastModified: Date.now()
        } : doc
      ));
      setError(null);
    } catch (err) {
      setError('Failed to update document');
      console.error('Document update error:', err);
    }
  }, []);

  const deleteDocument = (id: string) => {
    const filtered = documents.filter(d => d.id !== id);
    setDocuments(filtered);
    if (activeDocId === id) {
      if (filtered.length > 0) {
        setActiveDocId(filtered[0].id);
      } else {
        createNewDocument();
      }
    }
    localStorage.setItem('all_documents', JSON.stringify(filtered));
  };

  const duplicateDocument = (id: string) => {
    const original = documents.find(d => d.id === id);
    if (!original) return;
    
    const newDoc: Document = {
      ...original,
      id: Date.now().toString(),
      title: `${original.title} (Copy)`,
      timestamp: Date.now(),
      lastModified: Date.now(),
      version: 1,
      isPinned: false
    };
    
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
  };

  const toggleFavorite = (id: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
    ));
  };

  const togglePin = (id: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, isPinned: !doc.isPinned } : doc
    ));
  };

  // ==================== TEMPLATE FUNCTIONS ====================
  const loadTemplate = (templateKey: keyof typeof templates) => {
    const template = templates[templateKey];
    if (activeDoc) {
      updateDocument(activeDocId, { 
        title: template.title, 
        content: template.content 
      });
      if (editorRef.current) {
        editorRef.current.innerHTML = template.content;
      }
    } else {
      createNewDocument(undefined, template.content);
    }
    setShowTemplates(false);
  };

  const loadCustomTemplate = (template: CustomTemplate) => {
    if (activeDoc) {
      updateDocument(activeDocId, { 
        title: template.name, 
        content: template.content 
      });
      if (editorRef.current) {
        editorRef.current.innerHTML = template.content;
      }
    } else {
      createNewDocument(undefined, template.content);
    }
    setShowTemplates(false);
    setShowTemplateManager(false);
    
    // Update template usage count
    setCustomTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1, lastUsed: Date.now() } : t
    ));
  };

  const saveAsTemplate = () => {
    if (!activeDoc || !newTemplateName.trim()) return;
    
    const newTemplate: CustomTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      content: activeDoc.content,
      category: 'content',
      icon: 'FileText',
      isFavorite: false,
      usageCount: 0,
      tags: [],
      description: `Saved from "${activeDoc.title}"`
    };
    
    const updated = [...customTemplates, newTemplate];
    setCustomTemplates(updated);
    localStorage.setItem('custom_templates', JSON.stringify(updated));
    setNewTemplateName('');
    setShowTemplateManager(true);
  };

  const deleteCustomTemplate = (id: string) => {
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem('custom_templates', JSON.stringify(updated));
  };

  // ==================== EDITOR FUNCTIONS ====================
  const handleInput = useCallback(() => {
    if (editorRef.current && activeDoc) {
      updateDocument(activeDocId, { content: editorRef.current.innerHTML });
    }
  }, [activeDoc, activeDocId, updateDocument]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const saveToHistory = (content: string) => {
    setEditorState(prev => {
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), content];
      return {
        ...prev,
        history: newHistory.slice(-50), // Keep last 50 versions
        historyIndex: newHistory.length - 1
      };
    });
  };

  const handleUndo = () => {
    if (editorState.historyIndex > 0 && editorRef.current) {
      const previousContent = editorState.history[editorState.historyIndex - 1];
      editorRef.current.innerHTML = previousContent;
      setEditorState(prev => ({ ...prev, historyIndex: prev.historyIndex - 1 }));
      if (activeDoc) {
        updateDocument(activeDocId, { content: previousContent });
      }
    }
  };

  const handleRedo = () => {
    if (editorState.historyIndex < editorState.history.length - 1 && editorRef.current) {
      const nextContent = editorState.history[editorState.historyIndex + 1];
      editorRef.current.innerHTML = nextContent;
      setEditorState(prev => ({ ...prev, historyIndex: prev.historyIndex + 1 }));
      if (activeDoc) {
        updateDocument(activeDocId, { content: nextContent });
      }
    }
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          executeCommand('insertImage', event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const insertVideo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const videoHTML = `<video controls style="width: 100%; max-width: 600px; border-radius: 8px; margin: 10px 0;"><source src="${event.target.result}" type="${file.type}"></video><p></p>`;
          executeCommand('insertHTML', videoHTML);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const saveDocument = () => {
    if (activeDoc) {
      const content = editorRef.current?.innerHTML || '';
      updateDocument(activeDocId, { content });
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // ==================== EXPORT FUNCTIONS ====================
  const getPlainText = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const handleExportTxt = () => {
    if (!activeDoc) return;
    const plainText = getPlainText(activeDoc.content);
    const blob = new Blob([plainText], { type: 'text/plain' });
    downloadBlob(blob, `${activeDoc.title}.txt`);
  };

  const handleExportMarkdown = () => {
    if (!activeDoc) return;
    let markdown = activeDoc.content
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<b>(.*?)<\/b>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<i>(.*?)<\/i>/g, '*$1*')
      .replace(/<u>(.*?)<\/u>/g, '_$1_')
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      .replace(/<ul>|<\/ul>/g, '\n')
      .replace(/<ol>|<\/ol>/g, '\n')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<div>(.*?)<\/div>/g, '$1\n')
      .replace(/<[^>]+>/g, '');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadBlob(blob, `${activeDoc.title}.md`);
  };

  const handleExportHTML = () => {
    if (!activeDoc) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${activeDoc.title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; 
              line-height: 1.6; 
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: #fff;
            }
            h1, h2, h3 { color: #111; margin-top: 1.5em; margin-bottom: 0.5em; }
            h1 { font-size: 2.5em; border-bottom: 2px solid #eaeaea; padding-bottom: 10px; }
            h2 { font-size: 2em; }
            h3 { font-size: 1.5em; }
            p { margin-bottom: 1em; }
            ul, ol { margin-left: 20px; margin-bottom: 1em; }
            li { margin-bottom: 0.5em; }
            strong, b { font-weight: 600; }
            em, i { font-style: italic; }
            u { text-decoration: underline; }
            a { color: #0066cc; text-decoration: none; }
            a:hover { text-decoration: underline; }
            table { border-collapse: collapse; width: 100%; margin: 1em 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: 600; }
            blockquote { border-left: 4px solid #ddd; padding-left: 20px; margin-left: 0; color: #666; }
            code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: 'Monaco', 'Menlo', monospace; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
            img { max-width: 100%; height: auto; }
            hr { border: none; border-top: 1px solid #eaeaea; margin: 2em 0; }
            .content { word-wrap: break-word; }
            @media print {
              body { margin: 0; padding: 0; }
              h1 { page-break-before: always; }
              h2, h3 { page-break-after: avoid; }
              img { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="content">${activeDoc.content}</div>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    downloadBlob(blob, `${activeDoc.title}.html`);
  };

  const handleExportJSON = () => {
    if (!activeDoc) return;
    const docData = {
      ...activeDoc,
      exportedAt: new Date().toISOString(),
      exportFormat: 'json'
    };
    const json = JSON.stringify(docData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, `${activeDoc.title}.json`);
  };

  const handleExportPDF = () => {
    if (!activeDoc) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${activeDoc.title}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
            h1 { font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .content { word-wrap: break-word; }
          </style>
        </head>
        <body>
          <h1>${activeDoc.title}</h1>
          <div class="content">${activeDoc.content}</div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==================== CALENDAR FUNCTIONS ====================
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const handleDragStart = (e: React.DragEvent, docId: string) => {
    e.dataTransfer.setData('docId', docId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const docId = e.dataTransfer.getData('docId');
    if (docId) {
      const dateStr = targetDate.toISOString().split('T')[0];
      updateDocument(docId, { scheduledDate: dateStr, status: 'scheduled' });
    }
    setDraggingOver(null);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    setDraggingOver(dateStr);
  };

  const handleDragLeave = () => {
    setDraggingOver(null);
  };

  // ==================== UTILITY FUNCTIONS ====================
  const saveDocuments = () => {
    try {
      localStorage.setItem('all_documents', JSON.stringify(documents));
      localStorage.setItem('custom_templates', JSON.stringify(customTemplates));
      localStorage.setItem('editor_settings', JSON.stringify(editorState));
      setLastSaved(new Date());
    } catch (err) {
      setError('Failed to save documents');
      console.error('Save error:', err);
    }
  };

  const handleClear = () => {
    if (activeDoc) {
      updateDocument(activeDocId, { content: '', title: 'Untitled Document' });
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      saveToHistory('');
    }
    setShowClearDialog(false);
  };

  const handleMakeCopy = () => {
    if (!activeDoc) return;
    duplicateDocument(activeDocId);
    setShowFileMenu(false);
  };

  const handleRename = () => {
    if (activeDoc && renameValue.trim()) {
      updateDocument(activeDocId, { title: renameValue });
      setShowRenameDialog(false);
      setRenameValue('');
    }
  };

  const handleEmail = () => {
    if (!activeDoc) return;
    const subject = encodeURIComponent(activeDoc.title);
    const body = encodeURIComponent(getPlainText(activeDoc.content));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowFileMenu(false);
  };

  const handlePrintPreview = () => {
    if (!activeDoc) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${activeDoc.title}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
            h1 { font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .content { word-wrap: break-word; }
            @media print { body { margin: 0; padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>${activeDoc.title}</h1>
          <div class="content">${activeDoc.content}</div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  // ==================== FILTERED & SORTED DOCUMENTS ====================
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by tags
    if (tagFilter.length > 0) {
      filtered = filtered.filter(doc => 
        tagFilter.every(tag => doc.tags.includes(tag))
      );
    }
    
    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'modified':
          comparison = a.lastModified - b.lastModified;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    // Show pinned documents first
    if (sortBy === 'modified') {
      filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
    }
    
    return filtered;
  }, [documents, searchTerm, tagFilter, sortBy, sortOrder]);

  // ==================== FILTERED TEMPLATES ====================
    const filteredTemplates = useMemo(() => {
      const allTemplates = [...Object.entries(templates), ...customTemplates.map(t => [t.id, t])];
      const lower = searchTerm.toLowerCase();
      return allTemplates.filter(([key, template]) => {
        // Safely check for title and description on the template object before accessing
        const isObject = typeof template === 'object' && template !== null;
        const titleMatches = isObject && 'title' in template && String((template as any).title).toLowerCase().includes(lower);
        const descMatches = isObject && 'description' in template && (template as any).description && String((template as any).description).toLowerCase().includes(lower);
        return titleMatches || descMatches;
      });
    }, [searchTerm, customTemplates]);

  // ==================== RENDER ====================
  const plainText = activeDoc ? getPlainText(activeDoc.content) : '';
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = plainText.length;
  const wordGoalProgress = Math.min((wordCount / wordGoal) * 100, 100);

  // Update editor content when active doc changes
  useEffect(() => {
    if (activeDoc && editorRef.current) {
      editorRef.current.innerHTML = activeDoc.content;
    }
  }, [activeDocId]);

  // Determine actual dark mode based on system preference
  const getActualDarkMode = () => {
    if (editorState.darkMode === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return editorState.darkMode === 'dark' || editorState.darkMode === 'night';
  };

  const isDarkMode = getActualDarkMode();
  const darkModeClass = editorState.darkMode === 'night' ? 'bg-black' : editorState.darkMode === 'dark' ? 'bg-gray-900' : 'bg-white';

  function insertTable(arg0: number, arg1: number): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? (editorState.darkMode === 'night' ? 'dark bg-black' : 'dark bg-gray-900') : 'bg-gray-100'}`}>
      {/* Error Alert */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-700 hover:text-red-900">
            X
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div className="flex flex-col flex-1 min-w-0">
              <Input
                type="text"
                value={activeDoc?.title || ''}
                onChange={(e) => activeDoc && updateDocument(activeDocId, { title: e.target.value })}
                className="text-lg font-normal border-none shadow-none focus-visible:ring-0 px-1 py-0 h-7 dark:bg-transparent dark:text-white"
                placeholder="Untitled Document"
              />
              <div className="flex items-center gap-2 text-sm overflow-x-auto">
                <DropdownMenu open={showFileMenu} onOpenChange={setShowFileMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0">File</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 dark:bg-gray-800">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <FileText className="w-4 h-4 mr-2" />
                        New
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="dark:bg-gray-800">
                        <DropdownMenuItem onClick={() => { createNewDocument(); setShowFileMenu(false); }}>
                          Blank Document
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setShowTemplates(true); setShowFileMenu(false); }}>
                          From Template
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuItem>
                      <Folder className="w-4 h-4 mr-2" />
                      Open <span className="ml-auto text-xs text-muted-foreground">Ctrl+O</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleMakeCopy}>
                      <Copy className="w-4 h-4 mr-2" />
                      Make a copy
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Users className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="dark:bg-gray-800">
                        <DropdownMenuItem>Share with others</DropdownMenuItem>
                        <DropdownMenuItem>Copy link</DropdownMenuItem>
                        <DropdownMenuItem>Manage permissions</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="dark:bg-gray-800">
                        <DropdownMenuItem onClick={handleEmail}>Email this file</DropdownMenuItem>
                        <DropdownMenuItem>Email collaborators</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="dark:bg-gray-800">
                        <DropdownMenuItem onClick={() => { handleExportTxt(); setShowFileMenu(false); }}>Plain Text (.txt)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { handleExportMarkdown(); setShowFileMenu(false); }}>Markdown (.md)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { handleExportHTML(); setShowFileMenu(false); }}>HTML (.html)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { handleExportJSON(); setShowFileMenu(false); }}>JSON (.json)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { handleExportPDF(); setShowFileMenu(false); }}>PDF Document (.pdf)</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => { setRenameValue(activeDoc?.title || ''); setShowRenameDialog(true); setShowFileMenu(false); }}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => { setShowClearDialog(true); setShowFileMenu(false); }}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Move to trash
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <History className="w-4 h-4 mr-2" />
                        Version history
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="dark:bg-gray-800">
                        <DropdownMenuItem>See version history</DropdownMenuItem>
                        <DropdownMenuItem>Name current version</DropdownMenuItem>
                        <DropdownMenuItem>Restore previous version</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuItem>
                      <FileText className="w-4 h-4 mr-2" />
                      Make available offline
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem>
                      <Info className="w-4 h-4 mr-2" />
                      Details
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <Shield className="w-4 h-4 mr-2" />
                      Security limitations
                    </DropdownMenuItem>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Globe className="w-4 h-4 mr-2" />
                        Language
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="dark:bg-gray-800">
                        <DropdownMenuItem>English</DropdownMenuItem>
                        <DropdownMenuItem>Spanish</DropdownMenuItem>
                        <DropdownMenuItem>French</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuItem onClick={() => { setShowTemplateManager(true); setShowFileMenu(false); }}>
                      <Settings className="w-4 h-4 mr-2" />
                      Page setup
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => { handlePrintPreview(); setShowFileMenu(false); }}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print <span className="ml-auto text-xs text-muted-foreground">Ctrl+P</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0">Edit</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="dark:bg-gray-800">
                    <DropdownMenuItem onClick={handleUndo} disabled={editorState.historyIndex <= 0}>
                      <Undo2 className="w-4 h-4 mr-2" />
                      Undo <span className="ml-auto text-xs text-muted-foreground">Ctrl+Z</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleRedo} disabled={editorState.historyIndex >= editorState.history.length - 1}>
                      <Redo2 className="w-4 h-4 mr-2" />
                      Redo <span className="ml-auto text-xs text-muted-foreground">Ctrl+Y</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => document.execCommand('cut')}>
                      <Scissors className="w-4 h-4 mr-2" />
                      Cut <span className="ml-auto text-xs text-muted-foreground">Ctrl+X</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => document.execCommand('copy')}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy <span className="ml-auto text-xs text-muted-foreground">Ctrl+C</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => document.execCommand('paste')}>
                      <ClipboardPaste className="w-4 h-4 mr-2" />
                      Paste <span className="ml-auto text-xs text-muted-foreground">Ctrl+V</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => document.execCommand('pasteUnformatted')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Paste without Formatting <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+V</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => document.execCommand('selectAll')}>
                      <Check className="w-4 h-4 mr-2" />
                      Select All <span className="ml-auto text-xs text-muted-foreground">Ctrl+A</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => document.execCommand('delete')}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete <span className="ml-auto text-xs text-muted-foreground">Del</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Search className="w-4 h-4 mr-2" />
                      Find and Replace <span className="ml-auto text-xs text-muted-foreground">Ctrl+H</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0">View</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="dark:bg-gray-800">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Full Screen <span className="ml-auto text-xs text-muted-foreground">F11</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setEditorState(prev => ({ ...prev, showFormatting: !prev.showFormatting }))}>
                      <Check className="w-4 h-4 mr-2" />
                      Show Formatting Marks
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Zoom</DropdownMenuLabel>
                    <DropdownMenuItem>Zoom In</DropdownMenuItem>
                    <DropdownMenuItem>Zoom Out</DropdownMenuItem>
                    <DropdownMenuItem>Reset Zoom</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0">Insert</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="dark:bg-gray-800">
                    <DropdownMenuItem onClick={insertImage}>
                      <Image className="w-4 h-4 mr-2" />
                      Image <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+I</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Link className="w-4 h-4 mr-2" />
                        Link
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="dark:bg-gray-800">
                        <DropdownMenuItem onClick={() => { const url = prompt('Enter URL:'); if (url) executeCommand('createLink', url); }}>
                          Insert Link <span className="ml-auto text-xs text-muted-foreground">Ctrl+K</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Remove Link</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={insertVideo}>
                      <Code className="w-4 h-4 mr-2" />
                      Video
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Table className="w-4 h-4 mr-2" />
                        Table
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="dark:bg-gray-800">
                        <DropdownMenuItem onClick={() => insertTable(2, 2)}>2x2 Table</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertTable(3, 3)}>3x3 Table</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertTable(4, 4)}>4x4 Table</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => insertTable(5, 5)}>5x5 Table</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => executeCommand('insertHorizontalRule')}>
                      <Type className="w-4 h-4 mr-2" />
                      Horizontal Line
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Special Characters</DropdownMenuLabel>
                    <DropdownMenuItem>© © ® ™</DropdownMenuItem>
                    <DropdownMenuItem>× ÷ ± ≠</DropdownMenuItem>
                    <DropdownMenuItem>→ ← ↑ ↓</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0">Format</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="dark:bg-gray-800">
                    <DropdownMenuLabel>Text Formatting</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => executeCommand('bold')}>
                      <Bold className="w-4 h-4 mr-2" />
                      Bold <span className="ml-auto text-xs text-muted-foreground">Ctrl+B</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => executeCommand('italic')}>
                      <Italic className="w-4 h-4 mr-2" />
                      Italic <span className="ml-auto text-xs text-muted-foreground">Ctrl+I</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => executeCommand('underline')}>
                      <Underline className="w-4 h-4 mr-2" />
                      Underline <span className="ml-auto text-xs text-muted-foreground">Ctrl+U</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Alignment</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => executeCommand('justifyLeft')}>
                      <AlignLeft className="w-4 h-4 mr-2" />
                      Align Left
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => executeCommand('justifyCenter')}>
                      <AlignCenter className="w-4 h-4 mr-2" />
                      Align Center
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => executeCommand('justifyRight')}>
                      <AlignRight className="w-4 h-4 mr-2" />
                      Align Right
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Paragraph</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => executeCommand('insertUnorderedList')}>
                      <List className="w-4 h-4 mr-2" />
                      Bullet List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => executeCommand('insertOrderedList')}>
                      <ListOrdered className="w-4 h-4 mr-2" />
                      Numbered List
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Text Effects</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => executeCommand('strikeThrough')}>
                      <Type className="w-4 h-4 mr-2" />
                      Strikethrough
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => executeCommand('removeFormat')}>
                      <Type className="w-4 h-4 mr-2" />
                      Clear Formatting
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0">Tools</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="dark:bg-gray-800">
                    <DropdownMenuLabel>Document Tools</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Search className="w-4 h-4 mr-2" />
                      Find and Replace <span className="ml-auto text-xs text-muted-foreground">Ctrl+H</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditorState(prev => ({ ...prev, showWordCount: !prev.showWordCount }))}>
                      <Type className="w-4 h-4 mr-2" />
                      Word Count
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Settings className="w-4 h-4 mr-2" />
                        Line Height
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="dark:bg-gray-800">
                        <DropdownMenuItem onClick={() => setEditorState(prev => ({ ...prev, lineHeight: 1.0 }))}>Single (1.0)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditorState(prev => ({ ...prev, lineHeight: 1.5 }))}>1.5 Lines</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditorState(prev => ({ ...prev, lineHeight: 1.6 }))}>Double (1.6)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditorState(prev => ({ ...prev, lineHeight: 2.0 }))}>Double (2.0)</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Document Info</DropdownMenuLabel>
                    <DropdownMenuItem disabled>
                      <Clock className="w-4 h-4 mr-2" />
                      Created: {activeDoc ? new Date(activeDoc.timestamp).toLocaleDateString() : 'N/A'}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Clock className="w-4 h-4 mr-2" />
                      Modified: {activeDoc ? getRelativeTime(activeDoc.lastModified) : 'N/A'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Shield className="w-4 h-4 mr-2" />
                      Protect Document
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Check Spelling
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {isSaving ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="hidden sm:inline">Saving...</span>
              </div>
            ) : lastSaved ? (
              <div className="text-xs text-gray-500">
                Saved {getRelativeTime(lastSaved.getTime())}
              </div>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => toggleFavorite(activeDocId)}>
              <Star className={`w-5 h-5 ${activeDoc?.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => togglePin(activeDocId)}>
              <Bookmark className={`w-5 h-5 ${activeDoc?.isPinned ? 'fill-blue-500 text-blue-500' : ''}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {editorState.darkMode === 'light' ? <Sun className="w-4 h-4" /> : editorState.darkMode === 'dark' ? <Moon className="w-4 h-4" /> : editorState.darkMode === 'night' ? <Code className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-gray-800">
                <DropdownMenuItem onClick={() => setEditorState(prev => ({ ...prev, darkMode: 'light' }))}>
                  <Sun className="w-4 h-4 mr-2" />Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditorState(prev => ({ ...prev, darkMode: 'dark' }))}>
                  <Moon className="w-4 h-4 mr-2" />Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditorState(prev => ({ ...prev, darkMode: 'night' }))}>
                  <Code className="w-4 h-4 mr-2" />Night
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditorState(prev => ({ ...prev, darkMode: 'system' }))}>
                  <Check className="w-4 h-4 mr-2" />System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="hidden sm:inline-flex"><Eye className="w-4 h-4 mr-2" />Preview</Button>
            <Button variant="default" size="sm" className="hidden sm:inline-flex"><Users className="w-4 h-4 mr-2" />Share</Button>
          </div>
        </div>
                

      {/* Toolbar */}
      {activeView === 'page' && 
      (
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-1">
          <div className="flex items-center gap-1 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm"><Download className="w-4 h-4 mr-1" /> Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-gray-800">
                <DropdownMenuItem onClick={handleExportTxt}>Download as TXT</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportMarkdown}>Download as Markdown</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportHTML}>Download as HTML</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON}>Download as JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>Download as PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrintPreview}>Print Preview</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <Button variant="ghost" size="sm" onClick={handleUndo} disabled={editorState.historyIndex <= 0}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRedo} disabled={editorState.historyIndex >= editorState.history.length - 1}>
              <Redo2 className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <Button variant="ghost" size="sm" onClick={() => executeCommand('bold')}><Bold className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => executeCommand('italic')}><Italic className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => executeCommand('underline')}><Underline className="w-4 h-4" /></Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <Button variant="ghost" size="sm" onClick={() => executeCommand('insertUnorderedList')}><List className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => executeCommand('insertOrderedList')}><ListOrdered className="w-4 h-4" /></Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <Button variant="ghost" size="sm" onClick={() => executeCommand('justifyLeft')}><AlignLeft className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => executeCommand('justifyCenter')}><AlignCenter className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => executeCommand('justifyRight')}><AlignRight className="w-4 h-4" /></Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <Button variant="ghost" size="sm" onClick={insertImage}><Image className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => insertTable(3, 3)}><Table className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => { const url = prompt('Enter URL:'); if (url) executeCommand('createLink', url); }}><Link className="w-4 h-4" /></Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <select onChange={(e) => executeCommand('formatBlock', e.target.value)} className="h-7 px-2 rounded border border-input bg-background text-sm dark:bg-gray-700 dark:text-white" defaultValue="p">
              <option value="p">Normal text</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="blockquote">Quote</option>
              <option value="pre">Code</option>
            </select>
            
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value as FontSize)} className="h-7 px-2 rounded border border-input bg-background text-sm dark:bg-gray-700 dark:text-white">
              <option value="small">11px</option>
              <option value="medium">14px</option>
              <option value="large">18px</option>
              <option value="xlarge">24px</option>
            </select>
            
            <select value={editorState.editorFont} onChange={(e) => setEditorState(prev => ({ ...prev, editorFont: e.target.value }))} className="h-7 px-2 rounded border border-input bg-background text-sm dark:bg-gray-700 dark:text-white">
              <option value="Inter">Inter</option>
              <option value="Geist">Geist</option>
              <option value="Georgia">Georgia</option>
              <option value="Monaco">Monaco</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
            </select>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
          </div>
        </div>
      )}
      </header>


      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex gap-2 mb-3">
                <Input 
                  placeholder="Search documents..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 dark:bg-gray-700 dark:text-white"
                />
                <Button size="sm" variant="outline" onClick={() => setSearchTerm('')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={() => createNewDocument()} className="w-full mb-2"><Plus className="w-4 h-4 mr-2" />New Document</Button>
              <Button variant="outline" onClick={() => setShowTemplates(true)} className="w-full"><FileText className="w-4 h-4 mr-2" />Templates</Button>
            </div>
            
            <div className="flex-1 overflow-auto p-2">
              {filteredDocuments.filter(d => d.isFavorite).length > 0 && (
                <>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">FAVORITES</div>
                  {filteredDocuments.filter(d => d.isFavorite).map(doc => (
                    <div 
                      key={doc.id} 
                      className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer group ${activeDocId === doc.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`} 
                      onClick={() => setActiveDocId(doc.id)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, doc.id)}
                    >
                      {doc.isPinned && <Bookmark className="w-3 h-3 text-blue-500" />}
                      <FileText className="w-4 h-4 shrink-0 text-yellow-500" />
                      <span className="flex-1 truncate text-sm">{doc.title}</span>
                      {doc.status === 'published' && <Badge className="h-4 px-1 text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Live</Badge>}
                      {doc.status === 'scheduled' && <Badge className="h-4 px-1 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Scheduled</Badge>}
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); }}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Separator className="my-2" />
                </>
              )}
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2 flex justify-between items-center">
                <span>DOCUMENTS ({filteredDocuments.filter(d => !d.isFavorite).length})</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Filter className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dark:bg-gray-800">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('asc'); }}>Title A-Z</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('desc'); }}>Title Z-A</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('desc'); }}>Newest first</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('asc'); }}>Oldest first</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('modified'); setSortOrder('desc'); }}>Recently modified</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {filteredDocuments.filter(d => !d.isFavorite).map(doc => (
                <div 
                  key={doc.id} 
                  className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer group ${activeDocId === doc.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`} 
                  onClick={() => setActiveDocId(doc.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, doc.id)}
                >
                  {doc.isPinned && <Bookmark className="w-3 h-3 text-blue-500" />}
                  <FileText className={`w-4 h-4 shrink-0 ${doc.isFavorite ? 'text-yellow-500' : ''}`} />
                  <span className="flex-1 truncate text-sm">{doc.title}</span>
                  {doc.status === 'published' && <Badge className="h-4 px-1 text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Live</Badge>}
                  {doc.status === 'scheduled' && <Badge className="h-4 px-1 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Scheduled</Badge>}
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}>
                      <Star className={`w-3 h-3 ${doc.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); }}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                <div className="flex justify-between">
                  <span>Word Goal</span>
                  <span>{wordCount}/{wordGoal}</span>
                </div>
                <Progress value={wordGoalProgress} className="h-1 mt-1" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>{wordCount} words</div>
                <div>{charCount} characters</div>
                <div>{readingTime} min read</div>
                {activeDoc?.lastModified && (
                  <div className="text-[10px] mt-2">Last modified: {getRelativeTime(activeDoc.lastModified)}</div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* AI Button */}
        <div className="fixed bottom-8 left-4 sm:left-72 z-40">
          <style>{`
            @keyframes gradient-shift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .ai-button {
              width: 56px;
              height: 56px;
              background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
              background-size: 400% 400%;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              border: 1px solid #ddd;
              transition: transform 0.3s ease, background 1s ease;
            }
            .ai-button:hover {
              transition: background 1s ease-in-out;
              animation: gradient-shift 3s ease infinite;
              transform: scale(1.1);
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            .ai-button span {
              font-size: 24px;
            }
          `}</style>
          <button className="ai-button" title="AI Assistant">
            <span className='text-[64px] text-white'>●</span>
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewMode)} className="h-full flex flex-col">
            <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 pt-2 flex justify-center">
              <TabsList className="w-auto">
                <TabsTrigger value="page" className="hidden sm:flex"><FileText className="w-4 h-4 mr-2" />Page View</TabsTrigger>
                <TabsTrigger value="page" className="sm:hidden"><FileText className="w-4 h-4" /></TabsTrigger>
                
                <TabsTrigger value="calendar" className="hidden sm:flex"><CalendarIcon className="w-4 h-4 mr-2" />Calendar View</TabsTrigger>
                <TabsTrigger value="calendar" className="sm:hidden"><CalendarIcon className="w-4 h-4" /></TabsTrigger>
                
                <TabsTrigger value="list" className="hidden sm:flex"><List className="w-4 h-4 mr-2" />List View</TabsTrigger>
                <TabsTrigger value="list" className="sm:hidden"><List className="w-4 h-4" /></TabsTrigger>
                
                <TabsTrigger value="kanban" className="hidden sm:flex"><Columns className="w-4 h-4 mr-2" />Kanban</TabsTrigger>
                <TabsTrigger value="kanban" className="sm:hidden"><Columns className="w-4 h-4" /></TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="page" className="flex-1 m-0 overflow-auto">
              <div className="max-w-[850px] mx-auto py-8 px-4">
                <div ref={rulerRef} className="bg-white dark:bg-gray-800 mb-1 h-6 border-b border-gray-300 dark:border-gray-700 relative">
                  <div className="absolute inset-0 flex items-end">
                    {[...Array(17)].map((_, i) => (
                      <div key={i} className="flex-1 relative">
                        <div className="absolute bottom-0 left-0 w-px h-2 bg-gray-400 dark:bg-gray-600" />
                        {i % 2 === 0 && i < 16 && <div className="absolute bottom-0 left-0 text-[8px] text-gray-500 dark:text-gray-400 ml-1">{i}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-lg min-h-[1056px] p-16 relative dark:shadow-gray-900">
                  {activeDoc && !activeDoc.content && (
                    <div className="mb-8">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="cursor-pointer hover:border-blue-600 transition-colors p-4" onClick={() => setShowTemplates(true)}>
                          <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                            <FileText className="w-8 h-8 text-gray-400" />
                            <span className="text-sm font-medium text-center">Blank Document</span>
                          </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:border-blue-600 transition-colors p-4" onClick={() => loadTemplate('social_post')}>
                          <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                            <MessageSquare className="w-8 h-8 text-blue-400" />
                            <span className="text-sm font-medium text-center">Social Post</span>
                          </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:border-blue-600 transition-colors p-4" onClick={() => loadTemplate('email_campaign')}>
                          <CardContent className="p-0 flex flexcol items-center justify-center gap-2">
                            <Mail className="w-8 h-8 text-green-400" />
                            <span className="text-sm font-medium text-center">Email Campaign</span>
                          </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:border-blue-600 transition-colors p-4" onClick={() => loadTemplate('blog_article')}>
                          <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                            <FileText className="w-8 h-8 text-purple-400" />
                            <span className="text-sm font-medium text-center">Blog Article</span>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                  <div 
                    ref={editorRef} 
                    contentEditable 
                    onInput={handleInput} 
                    className={`focus:outline-none prose max-w-none dark:prose-invert ${fontSize === 'small' ? 'prose-sm' : fontSize === 'large' ? 'prose-lg' : fontSize === 'xlarge' ? 'prose-xl' : 'prose-base'}`} 
                    style={{ 
                      minHeight: '800px',
                      fontFamily: editorState.editorFont,
                      lineHeight: editorState.lineHeight 
                    }} 
                    suppressContentEditableWarning 
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="flex-1 m-0 p-8 overflow-auto">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold dark:text-white">Content Calendar</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-medium dark:text-white">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900">
                  <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="bg-gray-50 dark:bg-gray-800 p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">{day}</div>
                    ))}
                    {[...Array(35)].map((_, i) => {
                      const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                      cellDate.setDate(cellDate.getDate() - cellDate.getDay() + i);
                      const isToday = cellDate.toDateString() === new Date().toDateString();
                      const isCurrentMonth = cellDate.getMonth() === currentMonth.getMonth();
                      const dateStr = cellDate.toISOString().split('T')[0];
                      const dayDocs = documents.filter(doc => doc.scheduledDate === dateStr);
                      const isDraggingOver = draggingOver === dateStr;

                      return (
                        <div 
                          key={i}
                          onDragOver={(e) => handleDragOver(e, dateStr)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, cellDate)}
                          onClick={() => { setSelectedDate(new Date(cellDate)); setShowDayView(true); }}
                          className={`bg-white dark:bg-gray-800 p-3 min-h-[120px] cursor-pointer transition-all ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${!isCurrentMonth ? 'opacity-40' : ''} ${isDraggingOver ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                          <div className={`text-sm mb-2 flex justify-between ${isToday ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            <span>{cellDate.getDate()}</span>
                            {dayDocs.length > 0 && <Badge className="h-5 px-1 text-xs">{dayDocs.length}</Badge>}
                          </div>
                          <div className="space-y-1">
                            {dayDocs.map(doc => (
                              <div 
                                key={doc.id} 
                                draggable 
                                onDragStart={(e) => handleDragStart(e, doc.id)}
                                className={`text-[10px] p-1 rounded truncate cursor-move ${doc.status === 'published' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : doc.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}
                              >
                                {doc.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="list" className="flex-1 m-0 p-8 overflow-auto">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">All Documents</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Words</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Modified</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredDocuments.map(doc => (
                        <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {doc.isFavorite && <Star className="w-4 h-4 text-yellow-500 mr-2" />}
                              {doc.isPinned && <Bookmark className="w-4 h-4 text-blue-500 mr-2" />}
                              <span className={`font-medium ${activeDocId === doc.id ? 'text-blue-600 dark:text-blue-400' : 'dark:text-white'}`}>{doc.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={
                              doc.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              doc.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }>
                              {doc.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 dark:text-gray-300">{doc.wordCount}</td>
                          <td className="px-6 py-4 dark:text-gray-300">{getRelativeTime(doc.lastModified)}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setActiveDocId(doc.id)}>Edit</Button>
                              <Button variant="ghost" size="sm" onClick={() => duplicateDocument(doc.id)}>Duplicate</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="kanban" className="flex-1 m-0 p-8 overflow-auto">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Kanban Board</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {(['draft', 'scheduled', 'published', 'archived'] as DocumentStatus[]).map(status => (
                    <Card key={status} className="dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-lg capitalize">{status}</CardTitle>
                        <CardDescription>
                          {documents.filter(d => d.status === status).length} documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {documents.filter(d => d.status === status).map(doc => (
                          <Card 
                            key={doc.id} 
                            className="p-3 cursor-move dark:bg-gray-700"
                            draggable
                            onDragStart={(e) => handleDragStart(e, doc.id)}
                          >
                            <div className="text-sm font-medium dark:text-white">{doc.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {doc.wordCount} words • {getRelativeTime(doc.lastModified)}
                            </div>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Dialogs */}
      <AlertDialog open={showDayView} onOpenChange={setShowDayView}>
        <AlertDialogContent className="max-w-md dark:bg-gray-800 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedDate?.toDateString()}</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">Pages scheduled for this day</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 my-4">
            {documents.filter(doc => doc.scheduledDate === selectedDate?.toISOString().split('T')[0]).map(doc => (
              <Card key={doc.id} className="p-3 cursor-pointer dark:bg-gray-700" onClick={() => { setActiveDocId(doc.id); setActiveView('page'); setShowDayView(false); }}>
                <div className="text-sm font-medium dark:text-white">{doc.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{doc.status}</div>
              </Card>
            ))}
            {documents.filter(doc => doc.scheduledDate === selectedDate?.toISOString().split('T')[0]).length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No documents scheduled for this day
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Close</AlertDialogCancel>
            <Button onClick={() => { createNewDocument(selectedDate?.toISOString().split('T')[0]); setShowDayView(false); setActiveView('page'); }}>+ New Page</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <AlertDialogContent className="dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Rename Document</AlertDialogTitle>
          </AlertDialogHeader>
          <Input 
            value={renameValue} 
            onChange={(e) => setRenameValue(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleRename()} 
            className="dark:bg-gray-700 dark:text-white"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename} className="dark:bg-blue-600 dark:hover:bg-blue-700">Rename</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Clear this document?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              This will remove all content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} className="dark:bg-red-600 dark:hover:bg-red-700">Clear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showTemplates} onOpenChange={setShowTemplates}>
        <AlertDialogContent className="max-w-4xl dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Choose a Template</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              Start with a professionally designed template
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input 
            placeholder="Search templates..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 dark:bg-gray-700 dark:text-white"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-auto">
            {filteredTemplates.map(([key, template]) => {
              const isCustom = typeof template === 'object' && template !== null && 'name' in template && 'content' in template;
              const itemKey = String(key);
              return (
                <Card 
                  key={itemKey} 
                  className="cursor-pointer hover:border-blue-600 transition-colors dark:bg-gray-700"
                  onClick={() => {
                    if (isCustom) {
                      loadCustomTemplate(template as CustomTemplate);
                    } else {
                      loadTemplate(key as keyof typeof templates);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium dark:text-white">{typeof template === 'object' && template !== null && 'title' in template ? (template as any).title : String(template)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Template</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {typeof template === 'object' && template !== null && 'description' in template && (template as any).description ? (template as any).description : 'No description available'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <AlertDialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setShowTemplates(false); setShowTemplateManager(true); }} className="dark:border-gray-600 dark:text-white">
              Manage Templates
            </Button>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showTemplateManager} onOpenChange={setShowTemplateManager}>
        <AlertDialogContent className="max-w-3xl dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Template Manager</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              Create, edit, and manage your custom templates
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <h4 className="font-medium mb-2 dark:text-white">Save Current Document as Template</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Template name" 
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="flex-1 dark:bg-gray-700 dark:text-white"
                />
                <Button onClick={saveAsTemplate} disabled={!newTemplateName.trim()}>Save</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium dark:text-white">Your Templates ({customTemplates.length})</h4>
              {customTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No custom templates yet. Save your first template above.
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {customTemplates.map(template => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
                      <div>
                        <div className="font-medium dark:text-white">{template.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Used {template.usageCount} times • Last used {getRelativeTime(template.lastUsed)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => loadCustomTemplate(template)}>Use</Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteCustomTemplate(template.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Modal */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-2xl dark:bg-gray-800 h-[90vh] flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Content Preview</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              See how your content looks on different platforms
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex gap-2 mb-4">
            <Button 
              variant={previewPlatform === 'linkedin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewPlatform('linkedin')}
            >
              LinkedIn
            </Button>
            <Button 
              variant={previewPlatform === 'twitter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewPlatform('twitter')}
            >
              Twitter/X
            </Button>
            <Button 
              variant={previewPlatform === 'instagram' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewPlatform('instagram')}
            >
              Instagram
            </Button>
          </div>

          <div className="flex-1 overflow-auto mb-4 rounded-lg border dark:border-gray-700 p-4">
            {previewPlatform === 'linkedin' && (
              <div className="max-w-md mx-auto bg-white dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500"></div>
                  <div>
                    <div className="font-semibold text-sm dark:text-white">Your Name</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">1st degree • 2h</div>
                  </div>
                </div>
                <div className="text-sm dark:text-white line-clamp-6">{plainText || 'Your content will appear here'}</div>
                {activeDoc?.content.includes('<img') && (
                  <div className="rounded overflow-hidden">
                    <img 
                      src={activeDoc.content.match(/src="([^"]+)"/)?.[1] || ''} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                {activeDoc?.content.includes('<video') && (
                  <div className="rounded overflow-hidden">
                    <video 
                      controls 
                      className="w-full h-48 object-cover bg-black"
                    >
                      <source src={activeDoc.content.match(/src="([^"]+)"/)?.[1] || ''} />
                    </video>
                  </div>
                )}
                <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>↗️ Share</span>
                </div>
              </div>
            )}
            
            {previewPlatform === 'twitter' && (
              <div className="max-w-sm mx-auto bg-white dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-400"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm dark:text-white">Your Handle</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">@yourhandle • 2h</span>
                    </div>
                    <div className="text-sm dark:text-white mt-2 line-clamp-6">{plainText || 'Your content will appear here'}</div>
                    {activeDoc?.content.includes('<img') && (
                      <div className="rounded overflow-hidden mt-2">
                        <img 
                          src={activeDoc.content.match(/src="([^"]+)"/)?.[1] || ''} 
                          alt="Preview" 
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                    {activeDoc?.content.includes('<video') && (
                      <div className="rounded overflow-hidden mt-2">
                        <video 
                          controls 
                          className="w-full h-40 object-cover bg-black"
                        >
                          <source src={activeDoc.content.match(/src="([^"]+)"/)?.[1] || ''} />
                        </video>
                      </div>
                    )}
                    <div className="flex gap-8 text-xs text-gray-500 dark:text-gray-400 mt-3">
                      <span>💬</span>
                      <span>🔄</span>
                      <span>❤️</span>
                      <span>📤</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {previewPlatform === 'instagram' && (
              <div className="max-w-sm mx-auto bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                {activeDoc?.content.includes('<img') ? (
                  <img 
                    src={activeDoc.content.match(/src="([^"]+)"/)?.[1] || ''} 
                    alt="Preview" 
                    className="w-full aspect-square object-cover"
                  />
                ) : activeDoc?.content.includes('<video') ? (
                  <video 
                    controls 
                    className="w-full aspect-square object-cover bg-black"
                  >
                    <source src={activeDoc.content.match(/src="([^"]+)"/)?.[1] || ''} />
                  </video>
                ) : (
                  <div className="bg-gray-200 dark:bg-gray-600 aspect-square flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">Image/Video Preview</span>
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-400"></div>
                      <span className="font-semibold text-sm dark:text-white">yourhandle</span>
                    </div>
                    <span className="text-2xl">•••</span>
                  </div>
                  <div className="flex gap-4 text-lg">
                    <span>❤️</span>
                    <span>💬</span>
                    <span>✈️</span>
                    <span className="ml-auto">🔖</span>
                  </div>
                  <div className="text-sm dark:text-white">
                    <span className="font-semibold">yourhandle </span>
                    <span className="line-clamp-3">{plainText || 'Your content will appear here'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium dark:text-white">Content Readiness</span>
              <span className="text-sm font-bold dark:text-white">{Math.min(Math.floor((wordCount / 50) * 100), 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((wordCount / 50) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {wordCount < 10 && 'Add more content to reach posting readiness'}
              {wordCount >= 10 && wordCount < 50 && 'Getting better, keep going'}
              {wordCount >= 50 && wordCount < 100 && 'Nearly there, excellent content'}
              {wordCount >= 100 && 'Perfect! Ready to post'}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Close</AlertDialogCancel>
            <Button className="bg-blue-600 hover:bg-blue-700">Post Now</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}