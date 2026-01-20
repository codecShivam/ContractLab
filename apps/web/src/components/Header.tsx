import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Home, Menu, X, Code2, Layers } from 'lucide-react'
import theme from '../theme'
import { AuthButton } from './AuthButton'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header 
        className="h-14 flex items-center px-6 shadow-lg relative z-40"
        style={{ 
          backgroundColor: theme.bg.tertiary,
          borderBottom: `1px solid ${theme.border.subtle}`
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: theme.text.secondary, cursor: 'pointer' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.bg.hover
            e.currentTarget.style.color = theme.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = theme.text.secondary
          }}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        
        <Link to="/" className="ml-4 flex items-center gap-2">
          <h1 
            className="text-xl font-bold tracking-tight"
            style={{ 
              color: theme.text.primary
            }}
          >
            ContractLab
          </h1>
        </Link>

        {/* Quick nav links */}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1">
          <Link
            to="/"
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: theme.text.secondary }}
            activeProps={{
              style: { 
                color: theme.text.primary,
                backgroundColor: theme.bg.elevated 
              }
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = theme.bg.hover
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            Home
          </Link>
          <Link
            to="/contract-ide"
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: theme.text.secondary }}
            activeProps={{
              style: { 
                color: theme.text.primary,
                backgroundColor: theme.bg.elevated 
              }
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = theme.bg.hover
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            Contract IDE
          </Link>
          </div>
          
          {/* Auth Button */}
          <AuthButton />
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          backgroundColor: theme.bg.secondary,
          boxShadow: theme.effects.shadowLarge
        }}
      >
        <div 
          className="flex items-center justify-between p-5"
          style={{ borderBottom: `1px solid ${theme.border.subtle}` }}
        >
          <div className="flex items-center gap-2">
            <Layers size={24} style={{ color: theme.accent.primary }} />
            <h2 
              className="text-xl font-bold"
              style={{ color: theme.text.primary }}
            >
              Navigation
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: theme.text.secondary, cursor: 'pointer' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.hover
              e.currentTarget.style.color = theme.text.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = theme.text.secondary
            }}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg transition-all mb-2"
            style={{ color: theme.text.secondary }}
            activeProps={{
              style: { 
                color: theme.text.primary,
                backgroundColor: theme.accent.primary,
                boxShadow: theme.effects.glow
              }
            }}
            onMouseEnter={(e) => {
              if (!window.location.pathname.endsWith('/')) {
                e.currentTarget.style.backgroundColor = theme.bg.hover
              }
            }}
            onMouseLeave={(e) => {
              if (!window.location.pathname.endsWith('/')) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

          <Link
            to="/contract-ide"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg transition-all mb-2"
            style={{ color: theme.text.secondary }}
            activeProps={{
              style: { 
                color: theme.text.primary,
                backgroundColor: theme.accent.primary,
                boxShadow: theme.effects.glow
              }
            }}
            onMouseEnter={(e) => {
              if (!window.location.pathname.includes('contract-ide')) {
                e.currentTarget.style.backgroundColor = theme.bg.hover
              }
            }}
            onMouseLeave={(e) => {
              if (!window.location.pathname.includes('contract-ide')) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <Code2 size={20} />
            <span className="font-medium">Contract IDE</span>
          </Link>

          {/* Divider */}
          <div 
            className="my-4 h-px"
            style={{ backgroundColor: theme.border.subtle }}
          />

          {/* Info section */}
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: theme.bg.tertiary,
              border: `1px solid ${theme.border.subtle}`
            }}
          >
            <h3 
              className="text-sm font-semibold mb-2"
              style={{ color: theme.text.primary }}
            >
              Quick Start
            </h3>
            <p 
              className="text-xs leading-relaxed"
              style={{ color: theme.text.tertiary }}
            >
              Load any contract ABI and interact with smart contracts directly from your browser.
            </p>
          </div>
        </nav>

        {/* Footer */}
        <div 
          className="p-4 text-xs text-center"
          style={{ 
            borderTop: `1px solid ${theme.border.subtle}`,
            color: theme.text.tertiary
          }}
        >
          <p>ContractLab v1.0</p>
          <p className="mt-1">Web3 Developer Tools</p>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
          style={{ cursor: 'pointer' }}
        />
      )}
    </>
  )
}
