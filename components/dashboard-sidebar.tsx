'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShieldCheck,
  KeyRound,
  FileWarning,
  ScrollText,
  LayoutDashboard,
  Lock,
  Bot,
  ListTodo,
  Cpu,
  Globe,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { useAccessRequests } from '@/lib/store'

const monitorItems = [
  {
    href: '/dashboard',
    label: '概要',
    labelEn: 'Overview',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/dashboard/agents',
    label: 'エージェント',
    labelEn: 'Agents',
    icon: Bot,
  },
  {
    href: '/dashboard/jobs',
    label: 'ジョブ',
    labelEn: 'Jobs',
    icon: ListTodo,
  },
  {
    href: '/dashboard/models',
    label: 'モデル',
    labelEn: 'Models',
    icon: Cpu,
  },
  {
    href: '/dashboard/network',
    label: 'ネットワーク',
    labelEn: 'Network',
    icon: Globe,
  },
]

const securityItems = [
  {
    href: '/dashboard/policies',
    label: 'ポリシー',
    labelEn: 'Policies',
    icon: ShieldCheck,
  },
  {
    href: '/dashboard/credentials',
    label: 'クレデンシャル',
    labelEn: 'Credentials Vault',
    icon: KeyRound,
  },
  {
    href: '/dashboard/requests',
    label: 'アクセス要求',
    labelEn: 'Access Requests',
    icon: FileWarning,
  },
  {
    href: '/dashboard/audit',
    label: '監査ログ',
    labelEn: 'Audit Logs',
    icon: ScrollText,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { requests } = useAccessRequests()
  const pendingCount = requests.filter((r) => r.status === 'pending').length

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  function renderItems(items: typeof monitorItems) {
    return (
      <SidebarMenu>
        {items.map((item) => {
          const active = isActive(item.href, 'exact' in item ? item.exact : false)
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={active} tooltip={item.labelEn}>
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
              {item.href === '/dashboard/requests' && pendingCount > 0 && (
                <SidebarMenuBadge className="bg-destructive/10 text-destructive text-[10px]">
                  {pendingCount}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    )
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-3"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Lock className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">OpenXXX</span>
            <span className="text-[10px] text-muted-foreground">
              Security Console
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>モニター (Monitor)</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderItems(monitorItems)}
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>セキュリティ (Security)</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderItems(securityItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 text-[10px] text-muted-foreground">
          OpenXXX Security Console v0.1
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
