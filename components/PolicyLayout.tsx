import Link from 'next/link'

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
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
      <footer className="bg-white shadow mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center space-x-4">
            <Link href="/privacy-policy" className="text-gray-500 hover:text-gray-700">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="text-gray-500 hover:text-gray-700">
              Terms & Conditions
            </Link>
            <Link href="/refund-policy" className="text-gray-500 hover:text-gray-700">
              Refund Policy
            </Link>
            <Link href="/return-policy" className="text-gray-500 hover:text-gray-700">
              Return Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

