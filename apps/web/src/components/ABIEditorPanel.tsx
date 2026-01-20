import { useRef } from 'react'
import { 
  FileText, 
  Sparkles, 
  Package, 
  RotateCcw, 
  Upload, 
  Plus, 
  CheckCircle
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { MonacoEditor } from './MonacoEditor'
import { ABITab } from './ABITab'
import { Tooltip } from './Tooltip'
import { useABI } from '../contexts'
import theme from '../theme'

interface ABIEditorPanelProps {
  isValid: boolean
  functionCount: number
  readCount: number
  writeCount: number
  payableCount: number
  error?: string
}

export function ABIEditorPanel({
  isValid,
  functionCount,
  readCount,
  writeCount,
  payableCount,
  error
}: ABIEditorPanelProps) {
  const {
    abi,
    savedABIs,
    currentABIId,
    updateCurrentABI,
    handleSwitchABI,
    handleRenameABI,
    handleDeleteABI,
    handleNewABI,
    handleFileUpload,
    handleDragEnd,
    handleBeautify,
    handleMinify,
    handleReset
  } = useABI()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <>
      {/* Tab Bar */}
      <div className="flex items-center h-9" style={{ backgroundColor: theme.bg.secondary, borderBottom: `1px solid ${theme.border.subtle}` }}>
        {/* Tabs */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={savedABIs.map(a => a.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex items-center flex-1 overflow-x-auto h-full" style={{ scrollbarWidth: 'none' }}>
              {savedABIs.map((savedABI) => (
                <ABITab
                  key={savedABI.id}
                  abi={savedABI}
                  isActive={currentABIId === savedABI.id}
                  onClick={() => handleSwitchABI(savedABI.id)}
                  onClose={(e) => handleDeleteABI(savedABI.id, e)}
                  onRename={(newName) => handleRenameABI(savedABI.id, newName)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Actions */}
        <div className="flex items-center gap-0.5 px-1.5 h-full shrink-0" style={{ borderLeft: `1px solid ${theme.border.subtle}` }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Tooltip content="Upload ABI file">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded transition-colors"
              style={{ 
                color: theme.text.tertiary,
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.bg.hover
                e.currentTarget.style.color = theme.text.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = theme.text.tertiary
              }}
            >
              <Upload size={13} />
            </button>
          </Tooltip>

          <Tooltip content="New ABI tab">
            <button
              onClick={handleNewABI}
              className="p-1.5 rounded transition-colors"
              style={{ 
                color: theme.text.tertiary,
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.bg.hover
                e.currentTarget.style.color = theme.text.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = theme.text.tertiary
              }}
            >
              <Plus size={13} />
            </button>
          </Tooltip>

          {isValid && (
            <Tooltip content={`${functionCount} functions`}>
              <div className="flex items-center gap-1 px-2 text-xs" style={{ color: theme.text.tertiary }}>
                <CheckCircle size={12} style={{ color: theme.badge.valid.text }} />
              </div>
            </Tooltip>
          )}
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 relative">
        {!abi && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ backgroundColor: `${theme.bg.primary}80` }}>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <FileText className="w-16 h-16" style={{ color: theme.text.tertiary }} />
              </div>
              <p className="text-base font-medium" style={{ color: theme.text.secondary }}>
                Paste your ABI here
              </p>
              <p className="text-sm max-w-md" style={{ color: theme.text.tertiary }}>
                Supports: Hardhat, Foundry, Truffle artifacts, or pure ABI JSON
              </p>
              <div className="flex items-center justify-center gap-2 text-xs" style={{ color: theme.text.tertiary }}>
                <kbd className="px-2 py-1 rounded" style={{ backgroundColor: theme.bg.elevated }}>Ctrl+V</kbd>
                <span>to paste</span>
              </div>
            </div>
          </div>
        )}
        <MonacoEditor
          value={abi}
          onChange={(value) => updateCurrentABI(value || '')}
          language="json"
          height="100%"
          theme="vs-dark"
        />
      </div>
      
      {/* Footer */}
      <div className="h-10 flex items-center gap-2 px-3" style={{ backgroundColor: theme.bg.secondary, borderTop: `1px solid ${theme.border.subtle}` }}>
        <Tooltip content="Format JSON (Shift+Alt+F)">
          <button
            onClick={handleBeautify}
            className="px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5"
            style={{ backgroundColor: theme.button.secondary.bg, color: theme.button.secondary.text, cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.button.secondary.bgHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.button.secondary.bg}
          >
            <Sparkles size={14} /> Beautify
          </button>
        </Tooltip>
        <Tooltip content="Minify JSON">
          <button
            onClick={handleMinify}
            className="px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5"
            style={{ backgroundColor: theme.button.secondary.bg, color: theme.button.secondary.text, cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.button.secondary.bgHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.button.secondary.bg}
          >
            <Package size={14} /> Minify
          </button>
        </Tooltip>
        <Tooltip content="Clear editor">
          <button
            onClick={handleReset}
            className="px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5"
            style={{ backgroundColor: theme.button.secondary.bg, color: theme.button.secondary.text, cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.button.secondary.bgHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.button.secondary.bg}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </Tooltip>
        <div className="ml-auto flex items-center gap-2">
          {isValid ? (
            <span className="text-xs" style={{ color: theme.text.secondary }}>
              {functionCount} functions • 
              {readCount} read • 
              {writeCount} write • 
              {payableCount} payable
            </span>
          ) : (
            <span className="text-xs" style={{ color: theme.text.tertiary }}>
              {error || 'No ABI loaded'}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
