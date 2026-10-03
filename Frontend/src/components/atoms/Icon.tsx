export type IconName = 'mail' | 'lock' | 'eye' | 'eye-off' | 'arrow' | 'check' | 'alert' | 'shield' | 'close' | 'user' | 'leaf' | 'snail' | 'card' | 'calendar' | 'money'

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    'eye-off': <><path d="m3 3 18 18M10.5 5.1C17 4 22 12 22 12a22 22 0 0 1-3 4M6 6C3.5 8 2 12 2 12s3.5 7 10 7c1.5 0 3-.4 4.1-1M10 10a3 3 0 0 0 4 4" /></>,
    arrow: <path d="M4 12h15m-5-5 5 5-5 5" />,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
    alert: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5m0 3h.01" /></>,
    shield: <><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z" /><path d="m8 12 3 3 5-6" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
    leaf: <><path d="M20 3C6 3 3 9 5 15s12 9 15-12Z" /><path d="M4 21 15 10" /></>,
    snail: <><circle cx="10" cy="11" r="7" /><path d="M10 8a3 3 0 1 1-3 3M4 16v3h13a5 5 0 0 0 5-5h-5m2 0 1-4m1 1 2-2" /></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20M6 15h4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 11h18M7 15h3m4 0h3" /></>,
    money: <><path d="M12 2v20M17 6H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H7" transform="translate(0 -2)" /></>,
  }
  return <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
