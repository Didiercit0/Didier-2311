import type { ReactNode } from 'react'

interface CardHeadingProps {
  eyebrow: string
  title: string
  description?: string
  aside?: ReactNode
}

export function CardHeading({ eyebrow, title, description, aside }: CardHeadingProps) {
  return (
    <header className="card-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description && <p className="card-description">{description}</p>}
      </div>
      {aside}
    </header>
  )
}
