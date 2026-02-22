"use client"

import { GlobalNav } from "@/components/global-nav"
import Link from "next/link"
import { Shield } from "lucide-react"

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <GlobalNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="size-4" />
            <span className="text-sm font-medium">OpenXXX</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/download" className="hover:text-foreground transition-colors">Download</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            OpenXXX is a frontend demo. No real data is collected.
          </p>
        </div>
      </footer>
    </div>
  )
}
