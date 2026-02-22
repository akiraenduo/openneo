"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Download, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/download", label: "Download" },
  { href: "/dashboard", label: "Dashboard (Demo)" },
  { href: "/privacy", label: "Privacy" },
]

export function GlobalNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isDashboard = pathname.startsWith("/dashboard")

  if (isDashboard) return null

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="size-5 text-foreground" />
            <span className="text-base font-semibold tracking-tight text-foreground">OpenXXX</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === l.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/download">
                <Download className="size-3.5" />
                Download for Apple Silicon
              </Link>
            </Button>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="flex size-10 items-center justify-center rounded-md md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === l.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3">
              <Button asChild size="sm" className="w-full gap-1.5">
                <Link href="/download" onClick={() => setOpen(false)}>
                  <Download className="size-3.5" />
                  Download for Apple Silicon
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
