export type DashboardIconName = 'clock' | 'logout' | 'wallet' | 'receipt' | 'award' | 'chart' | 'garden'

export function DashboardIcon({ name, className = '' }: { name: DashboardIconName; className?: string }) {
  const paths: Record<DashboardIconName, React.ReactNode> = {
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    logout: <><path d="M9 4H4v16h5M10 12h11m-4-4 4 4-4 4" /></>,
    wallet: <><rect x="4" y="4" width="14" height="16" rx="2" /><path d="M8 8h10v8H8zM12 11v2" /></>,
    receipt: <><path d="M7 3h12v16H7zM7 7H4v14h12v-2M10 7h6m-6 4h6m-6 4h4" /></>,
    award: <><path d="m12 3 2 2 3-1 1 3 3 1-1 3 1 2-3 2-1 3-3-1-2 2-2-2-3 1-1-3-3-2 1-2-1-3 3-1 1-3 3 1 2-2Z" /><path d="m8 11 3 3 5-6" /></>,
    chart: <><circle cx="12" cy="12" r="9" /><path d="M12 3v18M12 12h9" /></>,
    garden: <><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M12 7v10m-4-4 4 4 4-4M8 8l4-2 4 2-4 3-4-3Z" /></>,
  }
  return <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
