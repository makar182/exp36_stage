import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { NotificationCenter, NotificationProvider } from '@/shared/notifications'

import './index.css'

import { App } from './app'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <App />
        <NotificationCenter />
      </NotificationProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
