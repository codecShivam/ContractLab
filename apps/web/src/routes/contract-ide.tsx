import { createFileRoute } from '@tanstack/react-router'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { GripVertical, GripHorizontal } from 'lucide-react'
import { TooltipProvider } from '../components/Tooltip'
import { TopBar } from '../components/TopBar'
import { HistoryPanel } from '../components/HistoryPanel'
import { ABIEditorPanel } from '../components/ABIEditorPanel'
import { FunctionExplorerPanel } from '../components/FunctionExplorerPanel'
import { ConsolePanel } from '../components/ConsolePanel'
import { ContractIDEProviders } from '../components/ContractIDEProviders'
import { useContractIDE } from '../hooks/useContractIDE'
import theme from '../theme'

export const Route = createFileRoute('/contract-ide')({
  component: ContractIDEWrapper,
})

function ContractIDEWrapper() {
  return (
    <ContractIDEProviders>
      <ContractIDE />
    </ContractIDEProviders>
  )
}

function ContractIDE() {
  const {
    parsedABI,
    allReadFunctions,
    allWriteFunctions,
    allPayableFunctions,
    handleFetchABI,
    handleCall,
    handleRerunFromHistory,
    handleLoadExample,
    filterFunctions,
    sortFunctions
  } = useContractIDE()

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col font-sans" style={{ backgroundColor: theme.bg.primary, color: theme.text.primary }}>
        {/* Top Bar */}
        <TopBar onFetchABI={handleFetchABI} />

        {/* History Panel */}
        <HistoryPanel onRerun={handleRerunFromHistory} />

        {/* Main Workspace */}
        <PanelGroup direction="vertical" className="flex-1">
          <Panel defaultSize={75} minSize={30}>
            <PanelGroup direction="horizontal">
              {/* Left Panel - ABI Editor */}
              <Panel 
                defaultSize={50} 
                minSize={25} 
                collapsible={true}
                className="flex flex-col" 
                style={{ borderRight: `1px solid ${theme.border.subtle}` }}
              >
                <ABIEditorPanel
                  isValid={parsedABI.isValid}
                  functionCount={parsedABI.functions.length}
                  readCount={parsedABI.readFunctions.length}
                  writeCount={parsedABI.writeFunctions.length}
                  payableCount={parsedABI.payableFunctions.length}
                  error={parsedABI.error}
                />
              </Panel>

              {/* Resize Handle */}
              <PanelResizeHandle className="w-1 hover:w-1.5 transition-all cursor-col-resize flex items-center justify-center group relative" style={{ backgroundColor: theme.border.subtle }}>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.text.tertiary }}>
                  <GripVertical size={16} />
                </div>
              </PanelResizeHandle>

              {/* Right Panel - Function Explorer */}
              <Panel 
                defaultSize={50} 
                minSize={25} 
                collapsible={true}
                className="flex flex-col" 
                style={{ backgroundColor: theme.bg.secondary }}
              >
                <FunctionExplorerPanel
                  allReadFunctions={allReadFunctions}
                  allWriteFunctions={allWriteFunctions}
                  allPayableFunctions={allPayableFunctions}
                  isValid={parsedABI.isValid}
                  error={parsedABI.error}
                  onLoadExample={handleLoadExample}
                  onCall={handleCall}
                  filterFunctions={filterFunctions}
                  sortFunctions={sortFunctions}
                />
              </Panel>
            </PanelGroup>
          </Panel>

          {/* Horizontal Resize Handle */}
          <PanelResizeHandle className="h-1 hover:h-1.5 transition-all cursor-row-resize flex items-center justify-center group" style={{ backgroundColor: theme.border.subtle, borderTop: `1px solid ${theme.console.border}` }}>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.text.tertiary }}>
              <GripHorizontal size={16} />
            </div>
          </PanelResizeHandle>

          {/* Bottom Console */}
          <Panel 
            defaultSize={25} 
            minSize={10}
            collapsible={true}
            className="flex flex-col"
            style={{ backgroundColor: theme.console.bg }}
          >
            <ConsolePanel />
          </Panel>
        </PanelGroup>
      </div>
    </TooltipProvider>
  )
}
