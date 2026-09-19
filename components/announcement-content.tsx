import Link from "next/link";
import { ArrowRight, Info, Sparkles, Tag, Truck } from "lucide-react";
import { isSafeAnnouncementLink, type AnnouncementInput } from "@/lib/announcements";

const icons = { truck: Truck, tag: Tag, sparkles: Sparkles, info: Info, none: null };

export function AnnouncementContent({ announcement, interactive = true }: Readonly<{ announcement: AnnouncementInput; interactive?: boolean }>) {
  const Icon = icons[announcement.icon];
  const text = announcement.text.trim();
  const linkLabel = announcement.linkLabel?.trim();
  const linkUrl = announcement.linkUrl?.trim();
  const hasLink = linkLabel && linkUrl && isSafeAnnouncementLink(linkUrl);
  const linkContent = <><span className="min-w-0 [overflow-wrap:anywhere]">{linkLabel}</span><ArrowRight aria-hidden="true" className="pointer-events-none h-4 w-4 shrink-0 sm:h-5 sm:w-5" /></>;
  const linkClassName = "inline-flex min-w-0 max-w-full items-center gap-2 rounded-sm font-semibold text-white";

  return (
    <div className="min-w-0 text-center text-base leading-6 [overflow-wrap:anywhere] sm:text-lg sm:leading-7">
      {Icon && <Icon aria-hidden="true" className="mr-3 inline-block h-5 w-5 align-middle text-slate-200 sm:h-6 sm:w-6" />}
      {text && <span className="font-semibold tracking-wide">{text}</span>}
      {hasLink && (
        <>
          {text && " "}
          <span className="inline-flex max-w-full items-center align-middle">
            {text && <span aria-hidden="true" className="mx-3 h-5 w-px shrink-0 bg-white/50 sm:mx-4 sm:h-6" />}
            {interactive ? (
              <Link href={linkUrl} prefetch={false} className={`${linkClassName} cursor-pointer underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}>
                {linkContent}
              </Link>
            ) : (
              <span className={linkClassName}>{linkContent}</span>
            )}
          </span>
        </>
      )}
    </div>
  );
}
