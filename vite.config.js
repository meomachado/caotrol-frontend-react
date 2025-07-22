import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Importe o 'path' do Node.js

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Cria um "atalho" @ que aponta para a pasta src
      '@': path.resolve(__dirname, './src'),
    },
  },
})