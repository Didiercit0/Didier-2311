import '@testing-library/jest-dom/vitest'
import { webcrypto } from 'node:crypto'
import { TextEncoder } from 'node:util'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// Se usa criptografía real de Node; jsdom aporta el DOM y LocalStorage.
vi.stubGlobal('crypto', webcrypto)
vi.stubGlobal('TextEncoder', TextEncoder)

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/#/login')
})

afterEach(() => {
  cleanup()
})
