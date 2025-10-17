import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase into its own chunk
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          // Split UI components
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          // Split PayPal
          'paypal': ['@paypal/react-paypal-js'],
          // Split email services
          'email': ['@emailjs/browser'],
          // Split form libraries
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Split charts
          'charts': ['recharts'],
          // Split animations
          'animations': ['framer-motion']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  }
})
