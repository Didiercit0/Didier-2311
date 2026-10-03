import { Icon } from '../atoms/Icon'

export function AuthNotice({ title, message, kind = 'error', onDismiss }: { title: string; message: string; kind?: 'error' | 'success'; onDismiss?: () => void }) {
  return <div className={`auth-notice notice-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
    <Icon name={kind === 'error' ? 'alert' : 'check'} />
    <div><strong>{title}</strong><p>{message}</p></div>
    {onDismiss && <button type="button" onClick={onDismiss} aria-label="Cerrar mensaje"><Icon name="close" /></button>}
  </div>
}
