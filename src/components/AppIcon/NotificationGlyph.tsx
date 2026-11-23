/**
 * Rebuilt from scratch as SVG — no cropped asset involved, so there is no
 * leftover badge rectangle to patch. Colors sampled from the undamaged
 * corners of the original Mitteilungen icon crop. The red count badge is a
 * separate, independent element (see Badge.tsx), never baked in here.
 */
export function NotificationGlyph() {
  return (
    <svg className="notif-glyph" viewBox="0 0 96 96" width="96" height="96" aria-hidden="true">
      <defs>
        <linearGradient id="notif-bg" x1="10%" y1="5%" x2="95%" y2="95%">
          <stop offset="0%" stopColor="#fdb3ab" />
          <stop offset="45%" stopColor="#f16a63" />
          <stop offset="100%" stopColor="#d13540" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="96" height="96" rx="21" fill="url(#notif-bg)" />
      <path
        d="M48 23c-11 0-16 8-16 22 0 12-6 16-6 16h44s-6-4-6-16c0-14-5-22-16-22z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M39 65a9 9 0 0018 0"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
