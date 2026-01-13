'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react'
import { toast } from 'sonner'

interface TemplateRichEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

/**
 * Editor de texto para templates
 * Nota: Para editor WYSIWYG completo, instale TipTap:
 * npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
 */
export function TemplateRichEditor({
  content,
  onChange,
  placeholder = 'Digite o conteúdo do template usando placeholders como {{NOME_CLIENTE}}...',
  className,
}: TemplateRichEditorProps) {
  const [editorContent, setEditorContent] = useState(content)
  const [history, setHistory] = useState<string[]>([content])
  const [historyIndex, setHistoryIndex] = useState(0)

  useEffect(() => {
    setEditorContent(content)
    setHistory([content])
    setHistoryIndex(0)
  }, [content])

  const handleContentChange = (value: string) => {
    setEditorContent(value)
    onChange(value)
    
    // Adicionar ao histórico
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(value)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevContent = history[historyIndex - 1]
      setEditorContent(prevContent)
      onChange(prevContent)
      setHistoryIndex(historyIndex - 1)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextContent = history[historyIndex + 1]
      setEditorContent(nextContent)
      onChange(nextContent)
      setHistoryIndex(historyIndex + 1)
    }
  }

  const handleFormat = (tag: string) => {
    const textarea = document.getElementById('template-editor-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editorContent.substring(start, end)
    
    let formattedText = ''
    if (tag === 'bold') {
      formattedText = `**${selectedText}**`
    } else if (tag === 'italic') {
      formattedText = `*${selectedText}*`
    }

    const newContent = editorContent.substring(0, start) + formattedText + editorContent.substring(end)
    handleContentChange(newContent)

    // Restaurar seleção
    setTimeout(() => {
      textarea.setSelectionRange(start + 2, start + 2 + selectedText.length)
      textarea.focus()
    }, 0)
  }

  return (
    <div className={`border border-slate-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50 p-2 flex items-center gap-1 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={historyIndex === 0}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={historyIndex === history.length - 1}
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <p className="text-xs text-slate-500">
          💡 Dica: Use placeholders como {'{{NOME_CLIENTE}}'} ou {'{{CPF_CLIENTE}}'}
        </p>
      </div>

      {/* Editor Content */}
      <div className="bg-white">
        <Textarea
          id="template-editor-textarea"
          value={editorContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[400px] font-mono text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
          style={{ fontFamily: 'monospace' }}
        />
      </div>
    </div>
  )
}

