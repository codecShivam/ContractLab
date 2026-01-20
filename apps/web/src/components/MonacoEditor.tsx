import { useRef } from 'react'
import Editor from '@monaco-editor/react'
import appTheme from '../theme'

interface MonacoEditorProps {
  value: string
  onChange?: (value: string | undefined) => void
  language?: 'json' | 'javascript' | 'typescript' | 'plaintext' | 'solidity'
  height?: string
  readOnly?: boolean
  theme?: 'vs-dark' | 'light' | 'vs'
  showMinimap?: boolean
}

export function MonacoEditor({
  value,
  onChange,
  language = 'json',
  height = '400px',
  readOnly = false,
  theme = 'vs-dark',
  showMinimap = false,
}: MonacoEditorProps) {
  const editorRef = useRef<any>(null)

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor

    if (language === 'json') {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: false,
        schemas: [],
        enableSchemaRequest: true,
      })
    }

    editor.focus()
  }

  return (
    <div className="h-full rounded-lg overflow-hidden shadow-sm">
      <Editor
        height={height}
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme={theme}
        loading={
          <div className="flex items-center justify-center h-full" style={{ backgroundColor: appTheme.bg.primary }}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `4px solid ${appTheme.accent.primary}`, borderTopColor: 'transparent' }}></div>
              <div style={{ color: appTheme.text.secondary }}>Loading editor...</div>
            </div>
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: showMinimap },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          padding: { top: 10, bottom: 10 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true,
          },
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  )
}
