import api from './api'

export const stocksService = {
  // Search stocks
  async search(query, limit = 10) {
    const response = await api.get('/stocks/search', {
      params: { q: query, limit }
    })
    return response.data
  },

  // Get stock details
  async getDetail(symbol) {
    const response = await api.get(`/stocks/${symbol}`)
    return response.data
  },

  // Get historical data
  async getHistory(symbol, period = '1mo', interval = '1d') {
    const response = await api.get(`/stocks/${symbol}/history`, {
      params: { period, interval }
    })
    return response.data
  },

  // Get real-time quote
  async getQuote(symbol) {
    const response = await api.get(`/stocks/${symbol}/quote`)
    return response.data
  }
}

export default stocksService
