import { cn } from '@utils/cn'

const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        'w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
      {...props}
    />
  )
}

export default Input
