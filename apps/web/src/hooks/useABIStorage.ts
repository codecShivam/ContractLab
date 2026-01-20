import { useState, useEffect, useCallback } from 'react'
import { storage } from '../utils/storage'
import { STORAGE_KEYS } from '../constants'
import type { SavedABI } from '../types/contract-ide.types'
import { ABISource } from '../types/storage.types'

export function useABIStorage() {
  const [abi, setABI] = useState('')
  const [savedABIs, setSavedABIs] = useState<SavedABI[]>([])
  const [currentABIId, setCurrentABIId] = useState<string | null>(null)

  // Load saved ABIs from storage on mount
  useEffect(() => {
    const saved = storage.get<SavedABI[]>(STORAGE_KEYS.SAVED_ABIS, [])
    
    if (saved && saved.length > 0) {
      setSavedABIs(saved)
      const savedId = storage.get<string>(STORAGE_KEYS.CURRENT_ABI_ID, undefined)
      
      if (savedId && saved.some(a => a.id === savedId)) {
        setCurrentABIId(savedId)
        const current = saved.find(a => a.id === savedId)
        if (current) setABI(current.content)
      } else {
        setCurrentABIId(saved[0].id)
        setABI(saved[0].content)
      }
    } else {
      // Create default tab if no saved ABIs
      const defaultABI: SavedABI = {
        id: Date.now().toString(),
        name: 'Untitled-1',
        content: '',
        timestamp: Date.now()
      }
      setSavedABIs([defaultABI])
      setCurrentABIId(defaultABI.id)
    }
  }, [])

  // Save ABIs to storage whenever they change
  useEffect(() => {
    if (savedABIs.length > 0) {
      storage.set(STORAGE_KEYS.SAVED_ABIS, savedABIs)
    }
  }, [savedABIs])

  // Save current ABI ID whenever it changes
  useEffect(() => {
    if (currentABIId) {
      storage.set(STORAGE_KEYS.CURRENT_ABI_ID, currentABIId)
    }
  }, [currentABIId])

  // Switch to a different ABI tab
  const switchABI = useCallback((id: string) => {
    const targetABI = savedABIs.find(a => a.id === id)
    if (targetABI) {
      setCurrentABIId(id)
      setABI(targetABI.content)
    }
  }, [savedABIs])

  // Update current ABI content
  const updateCurrentABI = useCallback((content: string) => {
    setABI(content)
    if (currentABIId) {
      setSavedABIs(prev =>
        prev.map(a =>
          a.id === currentABIId
            ? { ...a, content, timestamp: Date.now() }
            : a
        )
      )
    }
  }, [currentABIId])

  // Rename an ABI
  const renameABI = useCallback((id: string, newName: string) => {
    setSavedABIs(prev =>
      prev.map(a =>
        a.id === id ? { ...a, name: newName } : a
      )
    )
  }, [])

  // Add new ABI tab
  const addNewABI = useCallback(() => {
    const newABI: SavedABI = {
      id: Date.now().toString(),
      name: `Untitled-${savedABIs.length + 1}`,
      content: '',
      timestamp: Date.now()
    }
    setSavedABIs(prev => [...prev, newABI])
    setCurrentABIId(newABI.id)
    setABI('')
  }, [savedABIs.length])
  
  // Add new ABI with specific name and content (for fetched ABIs)
  const addNewABIWithData = useCallback((
    name: string, 
    content: string,
    contractAddress?: string,
    chainId?: number
  ) => {
    const newABI: SavedABI = {
      id: Date.now().toString(),
      name,
      content,
      timestamp: Date.now(),
      metadata: {
        contractAddress,
        chainId,
        source: contractAddress ? ABISource.FETCHED : ABISource.PASTED,
        verified: !!contractAddress,
      }
    }
    setSavedABIs(prev => [...prev, newABI])
    setCurrentABIId(newABI.id)
    setABI(content)
    return newABI.id
  }, [])

  // Delete an ABI tab
  const deleteABI = useCallback((id: string) => {
    setSavedABIs(prev => {
      const filtered = prev.filter(a => a.id !== id)
      
      // If deleting current ABI, switch to another
      if (id === currentABIId && filtered.length > 0) {
        const nextABI = filtered[0]
        setCurrentABIId(nextABI.id)
        setABI(nextABI.content)
      }
      
      // If no ABIs left, create a default one
      if (filtered.length === 0) {
        const defaultABI: SavedABI = {
          id: Date.now().toString(),
          name: 'Untitled-1',
          content: '',
          timestamp: Date.now()
        }
        setCurrentABIId(defaultABI.id)
        setABI('')
        return [defaultABI]
      }
      
      return filtered
    })
  }, [currentABIId])

  // Reorder ABIs (for drag and drop)
  const reorderABIs = useCallback((newOrder: SavedABI[]) => {
    setSavedABIs(newOrder)
  }, [])

  // Upload ABI from file
  const uploadABI = useCallback(async (file: File): Promise<void> => {
    const content = await file.text()
    const newABI: SavedABI = {
      id: Date.now().toString(),
      name: file.name.replace(/\.(json|txt|abi)$/, ''),
      content,
      timestamp: Date.now(),
      metadata: {
        source: ABISource.UPLOADED,
      }
    }
    setSavedABIs(prev => [...prev, newABI])
    setCurrentABIId(newABI.id)
    setABI(content)
  }, [])

  return {
    abi,
    savedABIs,
    currentABIId,
    switchABI,
    updateCurrentABI,
    renameABI,
    addNewABI,
    addNewABIWithData,
    deleteABI,
    reorderABIs,
    uploadABI,
  }
}
