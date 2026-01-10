import ResinFilters from "@/components/resins/ResinFilters";
import ResinGrid from "@/components/resins/ResinGrid";

export default function ResinsPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <br></br>
            <br></br> <br></br> <br></br> <br></br> <br></br>
            <div className="grid grid-cols-12 gap-8">
                <aside className="col-span-12 md:col-span-3">
                    <ResinFilters />
                </aside>
                <section className="col-span-12 md:col-span-9">
                    <ResinGrid />
                </section>
            </div>
        </div>
    );
}
