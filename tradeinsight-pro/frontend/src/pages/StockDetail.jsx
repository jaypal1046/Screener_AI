import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMarketData } from '../hooks/useMarketData'

/**
 * Stock Detail Component - Full view with all indicators
 */
export function StockDetail() {
  const { symbol } = useParams()
  const [timeframe, setTimeframe] = useState('1D')
  const { data, indicators, loading, error, refresh } = useMarketData(symbol, timeframe)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading {symbol}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>Error loading data: {error}</p>
        </div>
      </div>
    )
  }

  // Group indicators by category
  const categories = {
    trend: 'Trend',
    momentum: 'Momentum',
    volatility: 'Volatility',
    volume: 'Volume',
    support_resistance: 'Support/Resistance'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{symbol}</h1>
          <p className="text-gray-400">${data?.close?.toFixed(2) || 'N/A'} 
            <span className={`ml-2 ${data?.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data?.change >= 0 ? '+' : ''}{data?.changePercent?.toFixed(2)}%
            </span>
          </p>
        </div>
        
        <div className="flex gap-2">
          {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg ${
                timeframe === tf 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
          <button 
            onClick={refresh}
            className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Price Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">Open</p>
          <p className="text-white font-semibold">${data?.open?.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">High</p>
          <p className="text-white font-semibold">${data?.high?.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">Low</p>
          <p className="text-white font-semibold">${data?.low?.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">Volume</p>
          <p className="text-white font-semibold">{(data?.volume / 1000000).toFixed(2)}M</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">Prev Close</p>
          <p className="text-white font-semibold">${data?.prevClose?.toFixed(2)}</p>
        </div>
      </div>

      {/* Indicators by Category */}
      {Object.entries(categories).map(([key, label]) => {
        const categoryIndicators = indicators?.filter(i => i.category === key) || []
        
        return (
          <div key={key} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">{label} Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryIndicators.map((indicator) => (
                <div key={indicator.name} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-gray-400 text-sm font-medium">{indicator.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      indicator.signal === 'buy' ? 'bg-green-900 text-green-400' :
                      indicator.signal === 'sell' ? 'bg-red-900 text-red-400' : 
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {indicator.signal?.toUpperCase() || 'NEUTRAL'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value}
                  </p>
                  {indicator.description && (
                    <p className="text-gray-500 text-xs mt-2">{indicator.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StockDetail
