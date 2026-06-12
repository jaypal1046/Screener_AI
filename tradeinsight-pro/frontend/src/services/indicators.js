import api from './api'

export const indicatorsService = {
  // List all indicators
  async list(category = null) {
    const response = await api.get('/indicators/list', {
      params: { category }
    })
    return response.data
  },

  // Get indicator categories
  async getCategories() {
    const response = await api.get('/indicators/categories')
    return response.data
  },

  // Get indicators for a stock
  async getForStock(symbol, indicators = null, period = '1mo') {
    const response = await api.get(`/indicators/${symbol}`, {
      params: { indicators, period }
    })
    return response.data
  },

  // Get single indicator
  async getSingle(symbol, indicatorName, period = '1mo', params = null) {
    const response = await api.get(`/indicators/${symbol}/${indicatorName}`, {
      params: { period, params: params ? JSON.stringify(params) : null }
    })
    return response.data
  },

  // Calculate multiple indicators
  async calculate(data) {
    const response = await api.post('/indicators/calculate', data)
    return response.data
  }
}

export default indicatorsService
