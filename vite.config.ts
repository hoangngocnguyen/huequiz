import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <-- ĐỔI DÒNG NÀY (từ @vitejs/react-vite thành @vitejs/plugin-react)
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: "/huequiz",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})