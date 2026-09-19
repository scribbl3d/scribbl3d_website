import type { ReactNode } from "react";

export interface PolicySection {
  id: string;
  title: string;
  content: ReactNode;
}

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
  effectiveDate?: string;
  dateTime?: string;
  description?: string;
  sections?: PolicySection[];
}

export default function PolicyLayout({
  title, lastUpdated, children, effectiveDate, dateTime, description, sections,
}: PolicyLayoutProps) {
  if (sections) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 font-geistSans text-slate-900 selection:bg-blue-100 [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-blue-700">
        <a href="#policy-content" className="sr-only z-[70] rounded-md bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to policy content</a>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="rounded-t-2xl border-b border-blue-100 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 px-5 py-8 sm:p-10 lg:p-12">
              <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-10">
                <div>
                  <p className="mb-4 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    <span aria-hidden="true" className="h-1 w-7 rounded-full bg-blue-600" />Legal & policies
                  </p>
                  <h1 id="policy-title" className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">{title}</h1>
                  {description && <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{description}</p>}
                </div>
                <dl className="grid gap-4 rounded-xl border border-white bg-white/80 p-5 text-sm sm:grid-cols-2 lg:grid-cols-1">
                  {effectiveDate && (
                    <div>
                      <dt className="mb-1 text-xs text-slate-500">Effective date</dt>
                      <dd className="font-medium"><time dateTime={dateTime}>{effectiveDate}</time></dd>
                    </div>
                  )}
                  <div>
                    <dt className="mb-1 text-xs text-slate-500">Last updated</dt>
                    <dd className="font-medium"><time dateTime={dateTime}>{lastUpdated}</time></dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="px-5 py-7 sm:p-10 lg:px-12">
              <article id="policy-content" aria-labelledby="policy-title" tabIndex={-1} className="scroll-mt-[calc(var(--site-header-height,80px)+2rem)] text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-7 [&_a]:break-words [&_a]:font-medium [&_a]:text-blue-700 [&_a]:underline [&_a]:decoration-blue-200 [&_a]:underline-offset-4 [&_a:hover]:text-blue-900 [&_a:hover]:decoration-blue-700 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                <div className="space-y-4 border-b border-slate-200 pb-7">{children}</div>
                {sections.map((section, index) => (
                  <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} tabIndex={-1} className="scroll-mt-[calc(var(--site-header-height,80px)+2rem)] border-b border-slate-200 py-7 last:border-0">
                    <h2 id={`${section.id}-title`} className="mb-4 flex items-baseline gap-3 text-xl font-semibold leading-snug tracking-tight text-slate-900">
                      <span className="inline-flex min-w-9 shrink-0 justify-center rounded-lg bg-blue-50 px-2 py-1.5 text-base text-blue-700">{index + 1}.</span> {section.title}
                    </h2>
                    <div className="space-y-4">{section.content}</div>
                  </section>
                ))}
              </article>
              <p className="border-t border-slate-200 pt-5 text-xs text-slate-500">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <div className="mb-6">
                <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
              </div>
              <div className="prose max-w-none">{children}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
