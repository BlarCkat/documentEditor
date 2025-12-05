'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Save, FileText, Trash2, Download, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Clock, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface RecentDoc {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

const templates = {
  blank: { title: 'Untitled Document', content: '' },
  meeting: { 
    title: 'Meeting Notes', 
    content: '<h2>Meeting Notes</h2><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p><p><strong>Agenda:</strong></p><ul><li></li></ul><p><strong>Action Items:</strong></p><ul><li></li></ul>' 
  },
  blog: { 
    title: 'Blog Post', 
    content: '<h1>Blog Title</h1><p>Introduction paragraph...</p><h2>Section 1</h2><p>Content here...</p><h2>Section 2</h2><p>More content...</p>' 
  },
  report: {
    title: 'Report',
    content: '<h1>Report Title</h1><p><strong>Executive Summary</strong></p><p></p><h2>Background</h2><p></p><h2>Findings</h2><p></p><h2>Recommendations</h2><p></p>'
  }
};

export default function DocumentEditor() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(true);
  const [showRecentDocs, setShowRecentDocs] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string>('');
  const editorRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('doc_content');
    const savedTitle = localStorage.getItem('doc_title');
    const savedFontSize = localStorage.getItem('doc_fontSize');
    const savedDocId = localStorage.getItem('doc_id');
    const savedRecent = localStorage.getItem('recent_docs');
    
    if (savedContent) {
      setContent(savedContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = savedContent;
      }
    }
    if (savedTitle) setTitle(savedTitle);
    if (savedFontSize) setFontSize(savedFontSize as 'small' | 'medium' | 'large');
    if (savedDocId) setCurrentDocId(savedDocId);
    else {
      const newId = Date.now().toString();
      setCurrentDocId(newId);
      localStorage.setItem('doc_id', newId);
    }
    if (savedRecent) setRecentDocs(JSON.parse(savedRecent));
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content || title !== 'Untitled Document') {
        localStorage.setItem('doc_content', content);
        localStorage.setItem('doc_title', title);
        localStorage.setItem('doc_fontSize', fontSize);
        setLastSaved(new Date().toLocaleTimeString());
        setIsSaving(false);
        saveToRecent();
      }
    }, 1000);

    setIsSaving(true);
    return () => clearTimeout(timer);
  }, [content, title, fontSize]);

  const saveToRecent = () => {
    if (!content && title === 'Untitled Document') return;
    
    const doc: RecentDoc = {
      id: currentDocId,
      title,
      content,
      timestamp: Date.now()
    };
    
    const updated = [doc, ...recentDocs.filter(d => d.id !== currentDocId)].slice(0, 5);
    setRecentDocs(updated);
    localStorage.setItem('recent_docs', JSON.stringify(updated));
  };

  const loadRecentDoc = (doc: RecentDoc) => {
    setTitle(doc.title);
    setContent(doc.content);
    setCurrentDocId(doc.id);
    if (editorRef.current) {
      editorRef.current.innerHTML = doc.content;
    }
    localStorage.setItem('doc_id', doc.id);
    setShowRecentDocs(false);
  };

  const deleteRecentDoc = (docId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updated = recentDocs.filter(d => d.id !== docId);
    setRecentDocs(updated);
    localStorage.setItem('recent_docs', JSON.stringify(updated));
  };

  const loadTemplate = (templateKey: keyof typeof templates) => {
    const template = templates[templateKey];
    const newId = Date.now().toString();
    setTitle(template.title);
    setContent(template.content);
    setCurrentDocId(newId);
    if (editorRef.current) {
      editorRef.current.innerHTML = template.content;
    }
    localStorage.setItem('doc_id', newId);
    setShowTemplates(false);
    setShowWelcomeDialog(false);
  };

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleClear = () => {
    const newId = Date.now().toString();
    setContent('');
    setTitle('Untitled Document');
    setFontSize('medium');
    setCurrentDocId(newId);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    localStorage.removeItem('doc_content');
    localStorage.removeItem('doc_title');
    localStorage.removeItem('doc_fontSize');
    localStorage.setItem('doc_id', newId);
    setLastSaved(null);
    setShowClearDialog(false);
  };

  const getPlainText = () => {
    const temp = document.createElement('div');
    temp.innerHTML = content;
    return temp.textContent || temp.innerText || '';
  };

  const handleDownloadTxt = () => {
    const plainText = getPlainText();
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    let markdown = content
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .content {
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="content">${content}</div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handlePrintPreview = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .content {
              word-wrap: break-word;
            }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="content">${content}</div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const plainText = getPlainText();
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = plainText.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="w-6 h-6 text-primary shrink-0" />
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-2"
                placeholder="Document title"
              />
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              {lastSaved && (
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {isSaving ? 'Saving...' : `Saved at ${lastSaved}`}
                </span>
              )}

              <Button variant="ghost" onClick={() => setShowRecentDocs(true)}>
                <Clock className="w-4 h-4 mr-2" />
                Recent
              </Button>

              <Button variant="ghost" onClick={() => setShowTemplates(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>

              <Button variant={'ghost'}>
                Join the Waitlist
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownloadTxt}>
                    Download as TXT
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadMarkdown}>
                    Download as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadPDF}>
                    Download as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrintPreview}>
                    Print Preview
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="destructive" 
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('bold')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('italic')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('underline')}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('insertUnorderedList')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('insertOrderedList')}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('justifyLeft')}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('justifyCenter')}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => executeCommand('justifyRight')}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            <select
              onChange={(e) => executeCommand('formatBlock', e.target.value)}
              className="h-8 px-2 rounded-md border border-input bg-background text-sm"
              defaultValue="p"
            >
              <option value="p">Normal</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
              className="h-8 px-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editor */}
      <main className="flex-1 container mx-auto px-4">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className={`w-full h-full overflow-auto py-6 focus:outline-none prose max-w-none ${
            fontSize === 'small' ? 'prose-sm' : fontSize === 'large' ? 'prose-lg' : 'prose-base'
          }`}
          suppressContentEditableWarning
        />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{charCount} characters</span>
            <span>{wordCount} words</span>
          </div>
        </div>
      </footer>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all content from your document. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear}>
              Clear Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Welcome Dialog */}
      <AlertDialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">It's just a really simple good editor.</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Welcome to Superdocs MVP.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3 my-4">
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => loadTemplate('blank')}>
              <CardHeader>
                <CardTitle className="text-base">Blank Document</CardTitle>
                <CardDescription className="text-sm">Start from scratch</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => loadTemplate('meeting')}>
              <CardHeader>
                <CardTitle className="text-base">Meeting Notes</CardTitle>
                <CardDescription className="text-sm">Structured template</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => loadTemplate('blog')}>
              <CardHeader>
                <CardTitle className="text-base">Blog Post</CardTitle>
                <CardDescription className="text-sm">Article template</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => loadTemplate('report')}>
              <CardHeader>
                <CardTitle className="text-base">Report</CardTitle>
                <CardDescription className="text-sm">Professional format</CardDescription>
              </CardHeader>
            </Card>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWelcomeDialog(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recent Documents Dialog */}
      <Dialog open={showRecentDocs} onOpenChange={setShowRecentDocs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recent Documents</DialogTitle>
            <DialogDescription>
              Your recently edited documents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-auto">
            {recentDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recent documents</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  You haven't created any documents yet. Start writing to see them here.
                </p>
                <Button onClick={() => {
                  setShowRecentDocs(false);
                  setShowTemplates(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Document
                </Button>
              </div>
            ) : (
              recentDocs.map((doc) => (
                <Card 
                  key={doc.id} 
                  className="cursor-pointer hover:bg-accent transition-colors relative group"
                  onClick={() => loadRecentDoc(doc)}
                >
                  <CardHeader className="pr-12">
                    <CardTitle className="text-base">{doc.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {new Date(doc.timestamp).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => deleteRecentDoc(doc.id, e)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Document</DialogTitle>
            <DialogDescription>
              Choose a template to get started
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => loadTemplate('blank')}>
              <CardHeader>
                <CardTitle className="text-base">Blank Document</CardTitle>
                <CardDescription className="text-sm">Start from scratch</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => loadTemplate('meeting')}>
              <CardHeader>
                <CardTitle className="text-base">Meeting Notes</CardTitle>
                <CardDescription className="text-sm">Structured template</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => loadTemplate('blog')}>
              <CardHeader>
                <CardTitle className="text-base">Blog Post</CardTitle>
                <CardDescription className="text-sm">Article template</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => loadTemplate('report')}>
              <CardHeader>
                <CardTitle className="text-base">Report</CardTitle>
                <CardDescription className="text-sm">Professional format</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}