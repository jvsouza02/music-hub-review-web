export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Carregando conteúdo"
      className="mx-auto min-h-screen w-full max-w-7xl animate-pulse px-5 py-8 sm:px-8 lg:px-12"
    >
      <div className="h-10 w-48 rounded-lg bg-surface-muted" />
      <div className="mt-16 rounded-4xl border border-border bg-surface p-8 sm:p-14">
        <div className="h-3 w-44 rounded bg-surface-muted" />
        <div className="mt-8 h-14 max-w-3xl rounded-xl bg-surface-muted" />
        <div className="mt-3 h-14 max-w-2xl rounded-xl bg-surface-muted" />
        <div className="mt-8 h-4 max-w-xl rounded bg-surface-muted" />
        <div className="mt-3 h-4 max-w-lg rounded bg-surface-muted" />
        <div className="mt-10 h-12 w-44 rounded-full bg-surface-muted" />
      </div>
    </main>
  );
}
