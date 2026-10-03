import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function PrimaryButton({ children, pending = false, disabled = false }: { children: ReactNode; pending?: boolean; disabled?: boolean }) {
  return <button type="submit" className="primary-button" disabled={pending || disabled}>
    {pending ? <><span className="button-spinner" aria-hidden="true" />Un momento…</> : <>{children}<Icon name="arrow" /></>}
  </button>
}
