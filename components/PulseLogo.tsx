// Original "Pulse" logo — a heartbeat line plus wordmark, drawn inline so it
// scales crisply and inherits the surrounding text color for the wordmark.
export default function PulseLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 122 32"
      role="img"
      aria-label="Pulse logo"
      className={className}
    >
      <polyline
        points="3 17 14 17 19 8 26 26 31 12 34 17 45 17"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="52"
        y="23"
        fill="currentColor"
        fontSize="19"
        fontWeight="700"
        letterSpacing="0.4"
        fontFamily="inherit"
      >
        Pulse
      </text>
    </svg>
  );
}
