import './Wallpaper.css';

/**
 * Approximation of the dark blue "flowing lines" wallpaper seen in home.png:
 * a near-flat navy field crossed by three thin curved highlight lines.
 * Built as SVG paths fitted to brightness samples taken from the reference
 * image (not a cropped screenshot), per project rules — the curves are a
 * visual approximation of the original artwork, not a pixel-exact trace.
 */
export function Wallpaper() {
  return (
    <svg
      className="wallpaper"
      viewBox="0 0 1280 720"
      width="1280"
      height="720"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wp-corner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0c2746" />
          <stop offset="40%" stopColor="#030a16" />
          <stop offset="75%" stopColor="#061830" />
          <stop offset="100%" stopColor="#15375f" />
        </linearGradient>
        <filter id="wp-line-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      <rect x="0" y="0" width="1280" height="720" fill="url(#wp-corner)" />

      <g fill="none" strokeLinecap="round" filter="url(#wp-line-glow)">
        <path
          stroke="rgba(150,185,225,0.55)"
          strokeWidth="2"
          d="M 460.0,-10.0 Q 454.0,70.0 448.5,100.0 Q 443.0,130.0 421.5,165.0 Q 400.0,200.0 368.0,235.0 Q 336.0,270.0 292.0,310.0 Q 248.0,350.0 204.0,390.0 Q 160.0,430.0 150.0,470.0 Q 140.0,510.0 120.0,545.0 Q 100.0,580.0 70.0,615.0 Q 40.0,650.0 10.0,675.0 L -20.0,700.0"
        />
        <path
          stroke="rgba(150,185,225,0.5)"
          strokeWidth="2"
          d="M 925.0,-10.0 Q 925.0,70.0 914.5,100.0 Q 904.0,130.0 874.0,160.0 Q 844.0,190.0 812.5,210.0 Q 781.0,230.0 800.5,260.0 Q 820.0,290.0 789.5,320.0 Q 759.0,350.0 679.5,400.0 Q 600.0,450.0 540.0,500.0 Q 480.0,550.0 435.0,630.0 Q 390.0,710.0 375.0,720.0 L 360.0,730.0"
        />
        <path
          stroke="rgba(150,185,225,0.45)"
          strokeWidth="2"
          d="M 1259.0,-10.0 Q 1247.0,30.0 1230.0,50.0 Q 1213.0,70.0 1190.5,90.0 Q 1168.0,110.0 1140.0,130.0 Q 1112.0,150.0 1080.0,170.0 Q 1048.0,190.0 1030.5,200.0 Q 1013.0,210.0 1023.0,280.0 Q 1033.0,350.0 1016.5,370.0 Q 1000.0,390.0 970.0,430.0 Q 940.0,470.0 921.0,510.0 Q 902.0,550.0 891.0,580.0 Q 880.0,610.0 873.0,640.0 Q 866.0,670.0 862.0,700.0 L 858.0,730.0"
        />
      </g>
    </svg>
  );
}
