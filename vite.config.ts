import type { UserConfig } from 'vite'
import { resolve } from 'path'

export default {
  resolve: {
    // Resolves path aliases
    alias: {
      '@shared': resolve(import.meta.dirname, 'shared/'),
      '@data': resolve(import.meta.dirname, 'data/'),
      '@utils': resolve(import.meta.dirname, 'src/utils/'),
      '@sections': resolve(import.meta.dirname, 'src/sections/'),
    },
  },
} satisfies UserConfig
