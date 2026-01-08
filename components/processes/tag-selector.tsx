'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Tag, X } from 'lucide-react'
import { PROCESS_TAGS, TAG_LIST, ProcessTag } from '@/lib/constants/process-tags'

interface TagSelectorProps {
  selectedTags: ProcessTag[]
  onTagsChange: (tags: ProcessTag[]) => void
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const handleTagToggle = (tagId: ProcessTag) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((t) => t !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const handleClear = () => {
    onTagsChange([])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Tag className="w-4 h-4" />
              Etiquetas ({selectedTags.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
              {TAG_LIST.map((tag) => (
                <div
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`p-2 rounded-md cursor-pointer transition-colors flex items-center gap-2 ${
                    selectedTags.includes(tag.id)
                      ? `${tag.bgColor} ${tag.borderColor} border-2`
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${tag.color}`}
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${tag.textColor}`}>
                      {tag.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tag.description}
                    </p>
                  </div>
                  {selectedTags.includes(tag.id) && (
                    <div className={`w-4 h-4 rounded border-2 ${tag.borderColor} flex items-center justify-center`}>
                      <div className={`w-2 h-2 rounded-sm ${tag.color}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-slate-600 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Mostrar tags selecionadas */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tagId) => {
            const tag = PROCESS_TAGS[tagId]
            return (
              <Badge
                key={tagId}
                className={`${tag.bgColor} ${tag.textColor} border ${tag.borderColor} cursor-pointer hover:opacity-80`}
                onClick={() => handleTagToggle(tagId)}
              >
                {tag.label}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
