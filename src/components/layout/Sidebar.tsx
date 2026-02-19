'use client'

import { Clock, BarChart3, Folder, Settings, Image, ImageDownIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'

export function Sidebar() {

  const pathname = usePathname();

  const isActive = (href: string) => pathname.includes(href)

  const menuItems = [
    { id: 'timer', label: 'Temporizador', icon: Clock, href: '/dashboard/timer' },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3, href: '/dashboard/stats' },
    { id: 'projects', label: 'Proyectos', icon: Folder, href: '/dashboard/projects' },
  ]

  return (
    <aside className="hidden md:flex w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img src="/favicon-transparent.svg" alt="TicTak Logo" className="w-10 h-10" />
          <Link className="cursor-pointer" href="/">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            TicTak
          </h1>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 ${
                     isActive(item.id)
                      ? 'bg-[#38a3a5]/10 dark:bg-[#38a3a5]/20 text-[#38a3a5] dark:text-[#80ed99] hover:bg-[#38a3a5]/20 dark:hover:bg-[#38a3a5]/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#38a3a5] to-[#57cc99] flex items-center justify-center">
            <span className="text-white font-medium">U</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              Usuario
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Invitado
            </p>
          </div>

          <Link href="/dashboard/settings">
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 cursor-pointer ${
                isActive('settings')
                  ? 'bg-[#38a3a5]/10 dark:bg-[#38a3a5]/20 text-[#38a3a5] dark:text-[#80ed99]'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  )
}
