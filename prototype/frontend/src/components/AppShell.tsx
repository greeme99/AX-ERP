import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  ShoppingCart,
  Radar,
  Truck,
  Ship,
  ShieldCheck,
  Factory,
  Box,
  Landmark,
  ClipboardCheck,
  Plug,
  Sparkles,
  FileText,
  Bell,
  LogOut,
  Boxes,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { SessionsDialog } from '@/components/SessionsDialog'

const SIDEBAR_COLLAPSED_KEY = 'erp_sidebar_collapsed'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  roles?: string[] // 지정하면 해당 역할(+관리자)만 노출 — 없으면 로그인만 하면 전체 노출(v4/v5 정책과 동일)
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: '대시보드', icon: <LayoutDashboard size={16} /> },
  { to: '/mdm', label: '기준정보', icon: <Database size={16} /> },
  { to: '/sales', label: '영업', icon: <ShoppingCart size={16} /> },
  { to: '/scm', label: 'SCM', icon: <Radar size={16} /> },
  { to: '/procurement', label: '구매', icon: <Truck size={16} /> },
  { to: '/logistics', label: '물류', icon: <Ship size={16} /> },
  { to: '/production', label: '생산', icon: <Factory size={16} /> },
  { to: '/quality', label: '품질', icon: <ShieldCheck size={16} /> },
  { to: '/inventory', label: '재고', icon: <Box size={16} /> },
  { to: '/finance', label: '회계', icon: <Landmark size={16} />, roles: ['관리자'] },
  { to: '/approvals', label: '승인함', icon: <ClipboardCheck size={16} /> },
  { to: '/integrations', label: '연동 로그', icon: <Plug size={16} /> },
  { to: '/ai-agent', label: 'AI Agent', icon: <Sparkles size={16} /> },
  { to: '/reference', label: '참고 데이터', icon: <FileText size={16} /> },
]

const ROLE_COLOR: Record<string, string> = {
  관리자: 'bg-role-admin/10 text-role-admin',
  영업담당: 'bg-role-sales/10 text-role-sales',
  구매담당: 'bg-role-purchase/10 text-role-purchase',
  생산담당: 'bg-role-production/10 text-role-production',
}

export default function AppShell() {
  const { user, hasRole, logout } = useAuth()
  const navigate = useNavigate()
  // ChatGPT 스타일 사이드바 접기/펼치기. 데스크탑에서만 토글 가능 — 모바일은 항상 아이콘 레일 폭(w-16)
  // 으로 고정해 좁은 화면에서 레이아웃이 깨지지 않게 한다(요청: "모바일에서는 1열 기준으로 보정").
  // 선택 상태는 localStorage에 저장해 새로고침 후에도 유지된다.
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1')

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
      return next
    })
  }

  async function onLogout() {
    await logout()
    navigate('/login')
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || hasRole(...item.roles, '관리자'))

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside
        className={cn(
          'shrink-0 overflow-hidden border-r border-border-default bg-card p-3 transition-all duration-200 ease-in-out',
          'w-16',
          !collapsed && 'md:w-56',
        )}
      >
        <div className="mb-2 flex items-center gap-2 px-1 py-2">
          <Boxes size={20} className="shrink-0 text-brand" />
          <span
            className={cn(
              'truncate text-sm font-semibold text-text-primary',
              collapsed ? 'hidden' : 'hidden md:inline',
            )}
          >
            AX ERP
          </span>
        </div>

        {/* 접기/펼치기 토글 — 모바일에서는 항상 아이콘 레일이라 데스크탑(md 이상)에서만 노출 */}
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          className={cn(
            'mb-2 hidden h-7 w-7 shrink-0 items-center justify-center rounded-control text-text-secondary hover:bg-canvas md:inline-flex',
            collapsed ? 'mx-auto' : 'ml-auto',
          )}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>

        <nav className="flex flex-col gap-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 justify-center rounded-control px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-brand-soft',
                  !collapsed && 'md:justify-start',
                  isActive && 'bg-brand-soft font-medium text-brand',
                )
              }
            >
              {item.icon}
              <span className={cn('truncate', collapsed ? 'hidden' : 'hidden md:inline')}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-border-default bg-card px-4 py-3 md:px-6">
          <Bell size={17} className="text-text-secondary" />
          <SessionsDialog />
          {user?.roles.map((r) => (
            <span key={r} className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', ROLE_COLOR[r] ?? 'bg-canvas text-text-secondary')}>
              {r}
            </span>
          ))}
          <span className="text-sm text-text-primary">{user?.name}</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-danger"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
