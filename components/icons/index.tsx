/**
 * Inline SVG icon set for MENARA.
 *
 * Each icon uses `currentColor` for fill/stroke so callers can color it
 * via className. The one exception is `InstagramIcon`, which carries an
 * inline linear gradient (the Instagram brand mark is multi-color) — it
 * renders in brand colors regardless of `currentColor`.
 *
 * All icons are `aria-hidden` by default; accessible naming is the
 * parent's responsibility (e.g. <button aria-label="…">).
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

/** WhatsApp brand glyph (filled). Color via currentColor — set to #25D366. */
export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none" viewBox="0 0 24 24">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24Zm-3.6 4.43c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.63 1.12 2.81.14.18 1.92 2.94 4.66 4.12.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.61-.66 1.84-1.29.23-.63.23-1.17.16-1.29-.07-.11-.25-.18-.52-.32-.27-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.33-.8-.71-1.33-1.59-1.49-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01Z" />
    </svg>
  );
}

/** Shopee brand glyph (filled orange badge + white S). Color via currentColor — set to #EE4D2D. */
export function ShopeeIcon(props: IconProps) {
  const { className, width, height, ...rest } = props;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons8-shopee-100.png"
      alt=""
      width={typeof width === "number" ? width : 24}
      height={typeof height === "number" ? height : 24}
      className={className}
      aria-hidden="true"
    />
  );
}

/**
 * Instagram — uses an inline linear gradient (Instagram brand mark).
 * `currentColor` is ignored; the gradient renders in brand colors.
 */
export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="none" stroke="none" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="25%" stopColor="#FA7E1E" />
          <stop offset="50%" stopColor="#D62976" />
          <stop offset="75%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="url(#ig-grad)" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="17.6" cy="6.4" r="1.2" fill="#fff" />
    </svg>
  );
}

/** TikTok — black glyph with cyan/magenta accents. */
export function TikTokIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none" viewBox="0 0 24 24">
      <path d="M16.6 5.82c-.95-.62-1.6-1.66-1.78-2.86-.03-.18-.05-.36-.05-.55h-3.1v12.78c0 1.28-1.04 2.32-2.32 2.32a2.32 2.32 0 0 1-2.32-2.32c0-1.28 1.04-2.32 2.32-2.32.26 0 .51.04.74.12v-3.16a5.48 5.48 0 0 0-.74-.05A5.42 5.42 0 0 0 3.93 14.7a5.42 5.42 0 0 0 5.42 5.42c3 0 5.42-2.43 5.42-5.42V8.86a8.5 8.5 0 0 0 4.97 1.6V7.36c0-.5-.46-.94-1.14-1.54Z" />
    </svg>
  );
}

/** Facebook — blue filled glyph. Color via currentColor — set to #1877F2. */
export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none" viewBox="0 0 24 24">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

/** Maps pin — color via currentColor (set to Google red/blue). */
export function MapsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/** Filled star (rating). */
export function StarIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none" viewBox="0 0 24 24">
      <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.9l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.94L12 2.5Z" />
    </svg>
  );
}

/** Check mark. */
export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/**
 * Verified badge — blue circle with white check (social-media verified
 * style, like Instagram/Twitter). Carries its own accessible label
 * (role="img" + aria-label) since it conveys trust status on its own,
 * unlike decorative glyphs. Color is fixed (verified blue) regardless
 * of theme — this is a universal trust signal, not a brand element.
 */
export function VerifiedBadgeIcon(props: IconProps) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="Customer terverifikasi"
      focusable={false}
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill="#1D9BF0" />
      <path
        d="M7.5 12.5l3 3 6.5-6.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Right-pointing arrow (CTA affordance). */
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Chevron right — compact arrow for card affordance. */
export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

/** Lightning bolt. */
export function BoltIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none" viewBox="0 0 24 24">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

/** Flame / fire glyph (filled) — promo & flash-sale accent. */
export function FlameIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none" viewBox="0 0 24 24">
      <path d="M12 2s5 3.6 5 9.5a5 5 0 0 1-2.02 4.02c.32-.66.52-1.4.52-2.02 0-2.3-2-4-2-4s-.5 1.3-1.6 2.4c-1.1 1.1-1.9 2.1-1.9 3.35a3.1 3.1 0 0 0 .78 2.06A5 5 0 0 1 7 13.5C7 9 10 6.5 10 6.5s-.5 2 .5 3c0-2.5 1.5-5 1.5-7.5Z" />
    </svg>
  );
}

/** Shopping cart glyph. */
export function CartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2l2.2 11.2a1.5 1.5 0 0 0 1.48 1.2h8.1a1.5 1.5 0 0 0 1.47-1.18L21 7H6" />
    </svg>
  );
}

/** Factory glyph. */
export function FactoryIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 21V10l6 4V10l6 4V7l6 3v11H3Z" />
      <path d="M7 17h.01M11 17h.01M15 17h.01" />
    </svg>
  );
}

/** Sun (light-mode affordance). */
export function SunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

/** Moon (dark-mode affordance). */
export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

/** Catalog / grid glyph. */
export function CatalogIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

/** Gift / promo glyph. */
export function GiftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
      <path d="M2 7h20v5H2zM12 7v14" />
      <path d="M12 7S11 3 8.5 3 5 5 5 7s7 0 7 0ZM12 7s1-4 3.5-4S19 5 19 7s-7 0-7 0Z" />
    </svg>
  );
}

/** Info glyph. */
export function InfoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

/** Logout glyph (admin header). */
export function LogoutIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

/** Discount tag with percent — promo / diskon. */
export function TagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-8-8Z" />
      <path d="M9 13.5 13.5 9M9.25 9.25h.01M13.25 13.25h.01" />
    </svg>
  );
}

/** 2x2 grid — katalog. */
export function GridIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}

/** Shopping bag — order stat. */
export function BagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 7h12l1 13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L6 7Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

/** Shield with check — garansi. */
export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2 4.5 5v6c0 5 3.2 8.6 7.5 10 4.3-1.4 7.5-5 7.5-10V5L12 2Z" />
      <path d="m9 11.5 2.2 2.2L15.5 9.5" />
    </svg>
  );
}

/** Delivery truck — pengiriman. */
export function TruckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M1 4h13v12H1zM14 8h4l4 4v4h-8V8Z" />
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="18.5" cy="18.5" r="2" />
    </svg>
  );
}

/** Palette — desain bebas. */
export function PaletteIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-2a2 2 0 0 0-2 2c0 1 .5 1.5.5 2.5S13.5 21 12 21Z" />
      <circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Phone — telepon / call. */
export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

/** Email / surat. */
export function EmailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/** Chat bubble — live chat. */
export function ChatIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

/** Megaphone — pengumuman / promo. */
export function MegaphoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m3 11 18-5v12L3 13v-2Z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

/** Heart — favorit / cinta. */
export function HeartIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
    </svg>
  );
}

/** Clock — waktu / jam. */
export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

/** Map pin — lokasi. */
export function PinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/** Package — paket / box. */
export function PackageIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  );
}

/** T-shirt / jersey — apparel. */
export function JerseyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z" />
    </svg>
  );
}

/** Scissors — potong / jahit. */
export function ScissorsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
    </svg>
  );
}

/** Printer — printing / cetak. */
export function PrinterIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

/** Ruler — ukuran. */
export function RulerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2" />
    </svg>
  );
}

/** Percentage — diskon / promo. */
export function PercentIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M19 5 5 19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

/** Globe — website / global. */
export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 2a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z" />
      <path d="M2 12h20" />
    </svg>
  );
}

/** Sparkles — kilau / premium. */
export function SparklesIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none" viewBox="0 0 24 24">
      <path d="M12 2l1.09 3.36L16.36 6.5l-3.27 1.14L12 11l-1.09-3.36L7.64 6.5l3.27-1.14L12 2Z" />
      <path d="M18 12l.72 2.24 2.24.72-2.24.72L18 18l-.72-2.24L15 15l2.24-.72L18 12Z" />
      <path d="M7 16l.5 1.5 1.5.5-1.5.5L7 20l-.5-1.5L5 18l1.5-.5L7 16Z" />
    </svg>
  );
}

/** Crown — premium / juara. */
export function CrownIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none" viewBox="0 0 24 24">
      <path d="M2 20h20L19 8l-5 5-2-7-2 7-5-5-3 12Z" />
      <path d="M2 20h20" stroke="currentColor" strokeWidth="1.75" fill="none" />
    </svg>
  );
}

/** Users — tim / pelanggan. */
export function UsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/** Layers — tumpukan / lapisan. */
export function LayersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 2 10 6.5-10 6.5L2 8.5 12 2Z" />
      <path d="m2 15.5 10 6.5 10-6.5" />
      <path d="m2 12 10 6.5L22 12" />
    </svg>
  );
}

/** Truck fast — pengiriman kilat. */
export function TruckFastIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M1 3h15v13H1zM16 8h4l4 4v4h-8V8Z" />
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="18.5" cy="18.5" r="2" />
      <path d="M10 3v5" />
    </svg>
  );
}

/** Headset — customer service. */
export function HeadsetIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" />
    </svg>
  );
}

/** List — daftar. */
export function ListIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
