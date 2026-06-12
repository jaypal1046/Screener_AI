import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

/**
 * Hook for fetching and managing market data
 */
export function useMarketData(symbol, timeframe = '1D') {
  const [data, setData] = useState(null)
  const [indicators, setIndicators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch OHLCV data
      const ohlcvResponse = await api.get(`/stocks/${symbol}/ohlcv`, {
        params: { timeframe }
      })
      setData(ohlcvResponse.data)

      // Fetch indicators
      const indicatorsResponse = await api.get(`/indicators/${symbol}`, {
        params: { timeframe }
      })
      setIndicators(indicatorsResponse.data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching market data:', err)
    } finally {
      setLoading(false)
    }
  }, [symbol, timeframe])

  useEffect(() => {
    if (symbol) {
      fetchMarketData()
    }
  }, [symbol, timeframe, fetchMarketData])

  const refresh = () => fetchMarketData()

  return { data, indicators, loading, error, refresh }
}

/**
 * Hook for searching stocks
 */
export function useStockSearch(query) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const searchStocks = async () => {
      try {
        setLoading(true)
        const response = await api.get('/stocks/search', { params: { q: query } })
        setResults(response.data)
      } catch (err) {
        console.error('Error searching stocks:', err)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchStocks, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  return { results, loading }
}

/**
 * Hook for managing watchlist
 */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const response = await api.get('/stocks/watchlist')
      setWatchlist(response.data)
    } catch (err) {
      console.error('Error fetching watchlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToWatchlist = async (symbol) => {
    try {
      await api.post('/stocks/watchlist', { symbol })
      await fetchWatchlist()
    } catch (err) {
      console.error('Error adding to watchlist:', err)
      throw err
    }
  }

  const removeFromWatchlist = async (symbol) => {
    try {
      await api.delete(`/stocks/watchlist/${symbol}`)
      await fetchWatchlist()
    } catch (err) {
      console.error('Error removing from watchlist:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchWatchlist()
  }, [])

  return { watchlist, loading, addToWatchlist, removeFromWatchlist, refresh: fetchWatchlist }
}
