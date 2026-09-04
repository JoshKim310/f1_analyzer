"use client"
import Link from "next/link"
import { Github, Linkedin } from "lucide-react"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border shrink-0">
      <div className="px-4 py-6 sm:px-8 lg:px-20">
        <div className="flex flex-col items-start justify-start gap-6 sm:flex-row">
          <div>
            <h2 className="font-title text-xl tracking-widest uppercase text-f1-red">F1 Analyzer</h2>
            <p className="text-sm text-muted-foreground">Race analytics dashboard</p>
          </div>

          <nav className="flex flex-col gap-2 text-sm sm:ml-10 lg:ml-30">
            <span className="font-semibold">Quick Links</span>
            <Link href="/" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/race-calendar" className="text-muted-foreground hover:text-foreground">Race Calendar</Link>
            <Link href="/drivers" className="text-muted-foreground hover:text-foreground">Drivers</Link>
          </nav>

          <nav className="flex flex-col gap-2 text-sm sm:ml-4 lg:ml-10">
            <span className="font-semibold invisible select-none">Quick Links</span>
            <Link href="/constructors" className="text-muted-foreground hover:text-foreground">Constructors</Link>
            <Link href="/race-analysis" className="text-muted-foreground hover:text-foreground">Race Analysis</Link>
            <Link href="/ai-analytics" className="text-muted-foreground hover:text-foreground">AI Analytics</Link>
          </nav>

          <div className="flex flex-col gap-2 text-sm sm:ml-auto">
            <div className="flex items-center gap-3">
              <Link href="https://github.com/JoshKim310" target="_blank" aria-label="GitHub" className="text-muted-foreground hover:text-foreground">
                <Github className="size-4" />
              </Link>
              <Link href="https://www.linkedin.com/in/josh-kimm/" target="_blank" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-8 lg:px-20">
        © {year} F1 Analyzer. All rights reserved.
      </div>
    </footer>
  )
}