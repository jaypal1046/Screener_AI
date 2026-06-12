import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStockSearch } from '../hooks/useMarketData'

/**
 * Stock Search Component
 */
export function StockSearch() {
  const [query, setQuery] = useState('')
  const { results, loading } = useStockSearch(query)
  const navigate = useNavigate()

  const handleSelect = (symbol) => {
    navigate(`/stock/${symbol}`)
    setQuery('')
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stocks (e.g., AAPL, GOOGL)..."
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      
      {loading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {results.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleSelect(stock.symbol)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 flex justify-between items-center border-b border-gray-700 last:border-b-0"
            >
              <div>
                <span className="font-semibold text-white">{stock.symbol}</span>
                <span className="ml-2 text-gray-400 text-sm">{stock.name}</span>
              </div>
              <span className="text-xs text-gray-500">{stock.exchange}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default StockSearch
