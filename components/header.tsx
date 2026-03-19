"use client"
export function Header() {
    return (
        <header className="h-[var(--header-height)] shrink-0 border-b border-border px-6 py-4">
            <h1 className="font-heading text-2xl tracking-widest uppercase text-f1-red">F1 Analyzer</h1>
            <p className="text-sm text-muted-foreground">Race analytics dashboard</p>
        </header>
    )
}