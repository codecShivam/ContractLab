import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc } from '../../lib/trpc'

export const Route = createFileRoute('/demo/trpc')({
  component: TRPCDemo,
})

function TRPCDemo() {
  const [collectionName, setCollectionName] = useState('My Collection')
  const [collectionData, setCollectionData] = useState('{"test": true}')

  const healthQuery = trpc.health.useQuery()

  const saveCollectionMutation = trpc.saveCollection.useMutation({
    onSuccess: (data) => {
      console.log('Collection saved:', data)
      alert('Collection saved successfully!')
    },
    onError: (error) => {
      console.error('Error saving collection:', error)
      alert('Error saving collection')
    },
  })

  const handleSaveCollection = () => {
    try {
      const data = JSON.parse(collectionData)
      saveCollectionMutation.mutate({
        name: collectionName,
        data,
      })
    } catch (e) {
      alert('Invalid JSON in collection data')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">tRPC Demo</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Health Check
          </h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              Status:{' '}
              {healthQuery.isLoading ? (
                <span className="text-yellow-600">Loading...</span>
              ) : healthQuery.isError ? (
                <span className="text-red-600">Error</span>
              ) : (
                <span className="text-green-600">
                  {healthQuery.data || 'OK'}
                </span>
              )}
            </p>
            {healthQuery.isError && (
              <p className="text-red-600 text-sm">
                {healthQuery.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => healthQuery.refetch()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Refresh Health Check
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Save Collection
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="collection-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Collection Name
              </label>
              <input
                id="collection-name"
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter collection name"
              />
            </div>

            <div>
              <label
                htmlFor="collection-data"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Collection Data (JSON)
              </label>
              <textarea
                id="collection-data"
                value={collectionData}
                onChange={(e) => setCollectionData(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder='{"key": "value"}'
              />
            </div>

            <button
              type="button"
              onClick={handleSaveCollection}
              disabled={
                saveCollectionMutation.isPending || !collectionName.trim()
              }
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {saveCollectionMutation.isPending
                ? 'Saving...'
                : 'Save Collection'}
            </button>

            {saveCollectionMutation.isSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
                ✓ Collection saved successfully!
              </div>
            )}

            {saveCollectionMutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                ✗ Error: {saveCollectionMutation.error.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

