import { NavLink } from 'react-router-dom'
import { Home, Dumbbell, TrendingUp, Bot, User } from 'lucide-react'

const BottomNav = () => {
  return (
    <div className="flex items-center justify-around bg-[var(--color-card)] border-t border-[var(--color-border)] h-16 px-2">
      <BottomNavItem to="/" icon={<Home size={22} />} label="Início" />
      <BottomNavItem to="/treinos" icon={<Dumbbell size={22} />} label="Treinos" />
      <BottomNavItem to="/evolucao" icon={<TrendingUp size={22} />} label="Evolução" />
      <BottomNavItem to="/ia" icon={<Bot size={22} />} label="Coach IA" />
      <BottomNavItem to="/perfil" icon={<User size={22} />} label="Perfil" />
    </div>
  )
}

const BottomNavItem = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs
        ${isActive ? 'text-primary-600' : 'text-[var(--color-muted)]'}`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

export default BottomNav
