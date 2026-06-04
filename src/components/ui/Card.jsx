import { cn } from '@utils/cn'

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
