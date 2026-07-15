


import { BUSINESS } from "@/config/business";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.001 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.56-1.71a12.78 12.78 0 0 0 6.24 1.6h.01c7.06 0 12.79-5.73 12.79-12.8 0-3.42-1.33-6.63-3.75-9.05A12.71 12.71 0 0 0 16 3.2Zm0 23.36h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.89 1.02 1.04-3.79-.25-.4A10.59 10.59 0 0 1 5.4 16c0-5.85 4.76-10.6 10.61-10.6 2.83 0 5.49 1.1 7.49 3.11a10.52 10.52 0 0 1 3.1 7.5c0 5.85-4.75 10.6-10.6 10.6Zm5.81-7.93c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.77-2.2-.18-.32-.02-.5.14-.66.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54l-.61-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.39 5.39 4.76.75.32 1.34.52 1.8.66.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.37.18-1.51-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

export default function WhatsAppFAB() {
  return (
    <a
      href={`https://wa.me/${BUSINESS.whatsappFabrica}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Western%20e%20gostaria%20de%20falar%20com%20um%20consultor.`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com consultor no WhatsApp"
      style={{ bottom: "calc(1.25rem + var(--sticky-buy-bar-h, 0px))" }}
      className="group fixed right-5 md:right-7 z-50 inline-flex items-center h-11 md:h-12 pl-3 pr-3 md:hover:pr-5 rounded-full bg-western-green-deep text-western-gold-soft ring-1 ring-inset ring-western-gold/25 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.45)] hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out motion-reduce:transition-none"
    >
      <WhatsAppGlyph className="h-[20px] w-[20px] md:h-[22px] md:w-[22px] shrink-0" />
      <span className="hidden md:inline-block max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 group-hover:ml-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-western-cream transition-all duration-300 ease-out">
        Falar com consultor
      </span>
    </a>
  );
}
