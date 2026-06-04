import { cn } from '@utils/cn'

const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    outline: 'border border-[var(--color-border)] hover:bg-[var(--color-border)]',
    ghost: 'hover:bg-[var(--color-border)]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
