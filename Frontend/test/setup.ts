import '@testing-library/jest-dom/vitest'
import { webcrypto } from 'node:crypto'
import { TextEncoder } from 'node:util'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

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


Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
  configurable: true,
  value: function (this: HTMLDialogElement) { this.setAttribute('open', '') },
})
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: () => {},
})
