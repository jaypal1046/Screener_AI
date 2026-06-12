import React from 'react'
import { useMarketData } from '../hooks/useMarketData'

/**
 * Indicators Page - Complete list of all 40 indicators
 */
export function Indicators() {
  const { indicators, loading, error } = useMarketData('AAPL')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading indicators...</p>
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

  // Group by category
  const categories = {
    trend: { name: 'Trend Indicators', color: 'blue' },
    momentum: { name: 'Momentum Indicators', color: 'green' },
    volatility: { name: 'Volatility Indicators', color: 'yellow' },
    volume: { name: 'Volume Indicators', color: 'purple' },
    support_resistance: { name: 'Support/Resistance', color: 'orange' }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-2">All Technical Indicators</h1>
      <p className="text-gray-400 mb-8">Complete list of 40 technical indicators for AAPL</p>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(categories).map(([key, config]) => {
          const count = indicators?.filter(i => i.category === key).length || 0
          return (
            <div key={key} className={`bg-${config.color}-900/20 border border-${config.color}-800 rounded-lg p-4`}>
              <p className={`text-${config.color}-400 text-sm`}>{config.name}</p>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Full Indicator List */}
      {Object.entries(categories).map(([key, config]) => {
        const categoryIndicators = indicators?.filter(i => i.category === key) || []
        
        return (
          <div key={key} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className={`w-3 h-3 bg-${config.color}-500 rounded-full`}></span>
              {config.name}
            </h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Indicator</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Signal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Strength</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {categoryIndicators.map((indicator) => (
                    <tr key={indicator.name} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-white font-medium">{indicator.name}</td>
                      <td className="px-4 py-3 text-white">
                        {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          indicator.signal === 'buy' ? 'bg-green-900 text-green-400' :
                          indicator.signal === 'sell' ? 'bg-red-900 text-red-400' : 
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {indicator.signal?.toUpperCase() || 'NEUTRAL'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                indicator.strength > 70 ? 'bg-green-500' :
                                indicator.strength > 40 ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${indicator.strength || 50}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-400 text-xs">{indicator.strength || 50}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{indicator.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categoryIndicators.length === 0 && (
                <p className="px-4 py-8 text-gray-500 text-center">No indicators in this category</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Indicators
