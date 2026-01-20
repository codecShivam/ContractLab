import { useState, useEffect, useCallback } from 'react'
import type { FunctionTab, FunctionInputValues } from '../types/contract-ide.types'

const PINNED_KEY = 'contractlab_pinned_functions'
const INPUTS_KEY = 'contractlab_last_inputs'

export function useFunctionManagement() {
  const [activeTab, setActiveTab] = useState<FunctionTab>('read')
  const [expandedFunction, setExpandedFunction] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pinnedFunctions, setPinnedFunctions] = useState<Set<string>>(new Set())
  const [inputValues, setInputValues] = useState<FunctionInputValues>({})
  const [lastInputValues, setLastInputValues] = useState<FunctionInputValues>({})
  const [loadingFunction, setLoadingFunction] = useState<string | null>(null)

  // Load pinned functions from localStorage
  useEffect(() => {
    const savedPinned = localStorage.getItem(PINNED_KEY)
    if (savedPinned) {
      try {
        setPinnedFunctions(new Set(JSON.parse(savedPinned)))
      } catch (e) {
        console.error('Failed to load pinned functions:', e)
      }
    }
  }, [])

  // Load last input values from localStorage
  useEffect(() => {
    const savedInputs = localStorage.getItem(INPUTS_KEY)
    if (savedInputs) {
      try {
        setLastInputValues(JSON.parse(savedInputs))
      } catch (e) {
        console.error('Failed to load input history:', e)
      }
    }
  }, [])

  // Save pinned functions to localStorage
  useEffect(() => {
    localStorage.setItem(PINNED_KEY, JSON.stringify(Array.from(pinnedFunctions)))
  }, [pinnedFunctions])

  // Save last input values to localStorage
  useEffect(() => {
    localStorage.setItem(INPUTS_KEY, JSON.stringify(lastInputValues))
  }, [lastInputValues])

  // Toggle function expansion
  const toggleFunction = useCallback((functionName: string) => {
    setExpandedFunction(prev => prev === functionName ? null : functionName)
  }, [])

  // Toggle pin status
  const togglePin = useCallback((functionName: string) => {
    setPinnedFunctions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(functionName)) {
        newSet.delete(functionName)
      } else {
        newSet.add(functionName)
      }
      return newSet
    })
  }, [])

  // Update input value
  const updateInput = useCallback((functionName: string, inputName: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [functionName]: {
        ...prev[functionName],
        [inputName]: value
      }
    }))
  }, [])

  // Save current inputs as last used
  const saveInputsAsLast = useCallback((functionName: string) => {
    setLastInputValues(prev => ({
      ...prev,
      [functionName]: inputValues[functionName] || {}
    }))
  }, [inputValues])

  // Load last used inputs for a function
  const loadLastInputs = useCallback((functionName: string) => {
    const lastInputs = lastInputValues[functionName]
    if (lastInputs) {
      setInputValues(prev => ({
        ...prev,
        [functionName]: lastInputs
      }))
    }
  }, [lastInputValues])

  // Clear inputs for a function
  const clearInputs = useCallback((functionName: string) => {
    setInputValues(prev => {
      const newValues = { ...prev }
      delete newValues[functionName]
      return newValues
    })
  }, [])

  return {
    activeTab,
    setActiveTab,
    expandedFunction,
    setExpandedFunction,
    toggleFunction,
    searchQuery,
    setSearchQuery,
    pinnedFunctions,
    togglePin,
    inputValues,
    updateInput,
    lastInputValues,
    saveInputsAsLast,
    loadLastInputs,
    clearInputs,
    loadingFunction,
    setLoadingFunction,
  }
}

