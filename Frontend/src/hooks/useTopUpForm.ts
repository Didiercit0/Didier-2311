import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { TopUpInput, TopUpResult } from '../domain/payment'
import { validateTopUp } from '../lib/payment-validation'
import { topUp } from '../services/snailpay'

export function useTopUpForm(fullName: string) {
  const [fields, setFields] = useState<TopUpInput>({ cardNumber: '', expirationDate: '', cvv: '', fullName, amount: '' })
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<keyof TopUpInput, boolean>>>({})
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<TopUpResult | null>(null)
  const [lastAmount, setLastAmount] = useState(0)
  const locked = useRef(false)
  const validation = validateTopUp(fields)
  const errors = Object.fromEntries(Object.entries(validation).filter(([key]) => submitted || touched[key as keyof TopUpInput]))

  function change(field: keyof TopUpInput, value: string) {
    if (locked.current) return
    setFields(current => ({ ...current, [field]: value }))
    setResult(null)
  }

  function useExample() {
    if (locked.current) return
    setFields(current => ({ ...current, cardNumber: '1234123412341234', expirationDate: '12/26', cvv: '543' }))
    setResult(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked.current) return
    setSubmitted(true)
    setResult(null)
    const firstInvalid = Object.keys(validation)[0]
    if (firstInvalid) {
      const field = event.currentTarget.elements.namedItem(firstInvalid)
      if (field instanceof HTMLElement) field.focus()
      return
    }
    locked.current = true
    setLastAmount(Number(fields.amount))
    setPending(true)
    try {
      const response = await topUp(fields)
      setResult(response)
      if (response.outcome === 'approved') {
        setFields(current => ({ ...current, amount: '' }))
        setSubmitted(false)
        setTouched({})
      }
    } catch {
      setResult({ outcome: 'error', message: 'No pudimos completar la recarga. Tu saldo no se modificó.' })
    } finally {
      locked.current = false
      setPending(false)
    }
  }

  const state = pending ? 'loading' : result?.outcome ?? 'form'
  return { fields, errors, pending, result, lastAmount, state, change, useExample, submit, blur: (field: keyof TopUpInput) => setTouched(current => ({ ...current, [field]: true })) } as const
}
