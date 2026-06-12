// Format numbers with commas
export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return '-'
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

// Format currency
export const formatCurrency = (num, currency = 'USD') => {
  if (num === null || num === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

// Format percentage
export const formatPercent = (num, decimals = 2) => {
  if (num === null || num === undefined) return '-'
  return `${num > 0 ? '+' : ''}${formatNumber(num, decimals)}%`
}

// Format large numbers (K, M, B, T)
export const formatCompact = (num) => {
  if (num === null || num === undefined) return '-'
  
  const absNum = Math.abs(num)
  
  if (absNum >= 1e12) {
    return (num / 1e12).toFixed(2) + 'T'
  } else if (absNum >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B'
  } else if (absNum >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M'
  } else if (absNum >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K'
  }
  
  return formatNumber(num, 2)
}

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format datetime
export const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get signal color class
export const getSignalClass = (signal) => {
  switch (signal?.toLowerCase()) {
    case 'buy':
      return 'text-green-400 bg-green-500/20 border-green-500/30'
    case 'sell':
      return 'text-red-400 bg-red-500/20 border-red-500/30'
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
  }
}

// Get price change color
export const getPriceChangeClass = (change) => {
  if (change > 0) return 'text-green-400'
  if (change < 0) return 'text-red-400'
  return 'text-gray-400'
}
