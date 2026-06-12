import React from 'react'
import { useMarketData } from '../hooks/useMarketData'

/**
 * Dashboard Component - Main market overview
 */
export function Dashboard() {
  const { data, indicators, loading, error, refresh } = useMarketData('AAPL')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading market data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>Error loading data: {error}</p>
          <button 
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Market Overview</h1>
        <button 
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
        >
          Refresh
        </button>
      </div>

      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">AAPL Price</h3>
          <p className="text-2xl font-bold text-white">
            ${data?.close?.toFixed(2) || 'N/A'}
          </p>
          <p className={`text-sm ${data?.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data?.change >= 0 ? '+' : ''}{data?.changePercent?.toFixed(2)}%
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Volume</h3>
          <p className="text-2xl font-bold text-white">
            {(data?.volume / 1000000).toFixed(2)}M
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">RSI (14)</h3>
          <p className="text-2xl font-bold text-white">
            {indicators?.find(i => i.name === 'RSI')?.value?.toFixed(2) || 'N/A'}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-gray-400 text-sm mb-2">Overall Signal</h3>
          <p className="text-2xl font-bold text-green-500">NEUTRAL</p>
        </div>
      </div>

      {/* Indicators Grid Preview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Technical Indicators</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {indicators?.slice(0, 10).map((indicator) => (
            <div key={indicator.name} className="bg-gray-900 rounded p-4 border border-gray-700">
              <h4 className="text-gray-400 text-xs mb-2">{indicator.name}</h4>
              <p className="text-lg font-semibold text-white">
                {indicator.value?.toFixed(2) || 'N/A'}
              </p>
              <span className={`text-xs ${
                indicator.signal === 'buy' ? 'text-green-500' :
                indicator.signal === 'sell' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {indicator.signal?.toUpperCase() || 'NEUTRAL'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm mt-4">
          Showing 10 of {indicators?.length || 0} indicators. View all on the stock detail page.
        </p>
      </div>
    </div>
  )
}

export default Dashboard
