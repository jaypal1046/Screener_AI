import { useState, useEffect, useCallback, useRef } from 'react'

export function useWebSocket(url, onMessage, reconnectInterval = 5000) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  const connect = useCallback(() => {
    try {
      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        console.log('WebSocket connected:', url)
        setIsConnected(true)
      }

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setLastMessage(data)
        if (onMessage) {
          onMessage(data)
        }
      }

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected:', url)
        setIsConnected(false)
        
        // Attempt to reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }, [url, onMessage, reconnectInterval])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  return { isConnected, lastMessage, sendMessage }
}

export default useWebSocket
