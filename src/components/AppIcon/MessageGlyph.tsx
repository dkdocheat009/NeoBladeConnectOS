/**
 * Rebuilt from scratch as SVG — no cropped asset involved, so there is no
 * leftover badge rectangle to patch. Colors sampled from the undamaged
 * corners of the original Nachrichten icon crop. The red count badge is a
 * separate, independent element (see Badge.tsx), never baked in here.
 */
export function MessageGlyph() {
  return (
    <svg className="message-glyph" viewBox="0 0 96 96" width="96" height="96" aria-hidden="true">
      <defs>
        <linearGradient id="msg-bg" x1="10%" y1="5%" x2="95%" y2="95%">
          <stop offset="0%" stopColor="#a9f6bc" />
          <stop offset="45%" stopColor="#5ddc84" />
          <stop offset="100%" stopColor="#2bbf56" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="96" height="96" rx="21" fill="url(#msg-bg)" />
      <path
        d="M48 24c-13.8 0-25 9.4-25 21 0 7 4 13.2 10.3 17.1-0.3 2.6-1.4 6-4.1 9.4
           5-0.8 9-3 11.6-5 2.2 0.6 4.6 0.9 7.2 0.9 13.8 0 25-9.4 25-21s-11.2-21-25-21z"
        fill="#ffffff"
      />
    </svg>
  );
}
