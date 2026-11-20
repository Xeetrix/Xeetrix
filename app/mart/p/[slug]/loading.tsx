export default function MartProductLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-14 sm:h-16 border-b border-slate-200 bg-white" />
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        <div className="h-12 w-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            <div className="lg:col-span-6 aspect-square rounded-2xl bg-slate-100 animate-pulse" />
            <div className="lg:col-span-6 space-y-4">
              <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
              <div className="h-8 w-3/4 rounded bg-slate-100 animate-pulse" />
              <div className="h-9 w-40 rounded bg-slate-100 animate-pulse" />
              <div className="h-24 w-full rounded-xl bg-slate-100 animate-pulse" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                <div className="h-12 rounded-xl bg-slate-200 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
