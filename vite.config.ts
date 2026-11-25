import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Alias @ al directorio src
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Tipos de archivo que se pueden importar como recurso. No añadir .css, .tsx ni .ts.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
