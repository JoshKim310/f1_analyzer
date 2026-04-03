export default async function AIAnalyticsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-f1-red">
          AI Analytics
        </p>
        <h1 className="mt-3 font-heading text-3xl">Page Under Progress</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This section is currently in development. Check back soon for the full AI analytics experience.
        </p>
        <img 
          src="/soft-tire.png"
          alt="Soft Tire"
          width={100}
          height={100}
          className="animate-spin [animation-duration:4s] mx-auto mt-6"
        />
      </div>
    </div>
  )
}