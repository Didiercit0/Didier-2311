import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { validateAuth } from '../lib/validation'
import type { AuthFields, FieldErrors } from '../lib/validation'

export function useAuthForm(registering: boolean, initialEmail = '') {
  const [fields, setFields] = useState<AuthFields>({ fullName: '', email: initialEmail, password: '', confirmPassword: '', accepted: false })
  const [touched, setTouched] = useState<Partial<Record<keyof AuthFields, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const locked = useRef(false)
  const validation = validateAuth(fields, registering)
  const errors: FieldErrors = Object.fromEntries(Object.entries(validation).filter(([key]) => submitted || touched[key as keyof AuthFields]))
  function change<K extends keyof AuthFields>(field: K, value: AuthFields[K]) {
    setFields(current => ({ ...current, [field]: value }))
    setError('')
  }
  const blur = (field: keyof AuthFields) => setTouched(current => ({ ...current, [field]: true }))
  async function submit(event: FormEvent<HTMLFormElement>, action: () => Promise<void>) {
    event.preventDefault()
    if (locked.current) return
    setSubmitted(true); setError('')
    const firstInvalid = Object.keys(validation)[0]
    if (firstInvalid) {
      const element = event.currentTarget.elements.namedItem(firstInvalid)
      if (element instanceof HTMLElement) element.focus()
      return
    }
    locked.current = true; setPending(true)
    try { await action() }
    catch (issue) { setError(issue instanceof Error ? issue.message : 'No pudimos completar la operación. Intenta de nuevo.') }
    finally { locked.current = false; setPending(false) }
  }
  return { fields, errors, touched, pending, error, clearError: () => setError(''), change, blur, submit }
}
