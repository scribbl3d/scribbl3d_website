// app/resins/page.tsx — Server Component
import ResinsPageClient from './_components/ResinsPageClient';

export { type ResinFiltersState } from './_components/ResinsPageClient';

export default function ResinsPage() {
    return <ResinsPageClient />;
}