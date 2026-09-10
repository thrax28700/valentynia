// Jeu d'icônes fines et minimalistes — tracé 1.5, arrondis, sans remplissage.
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

const make =
  (paths: React.ReactNode) =>
  ({ size = 20, ...props }: IconProps) => (
    <svg {...base(size)} {...props}>
      {paths}
    </svg>
  );

export const Icon = {
  Home: make(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>),
  Users: make(
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.5a3 3 0 0 1 0 6" />
      <path d="M17 20a6.4 6.4 0 0 0-3-5.4" />
    </>,
  ),
  Calendar: make(
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 3v3M16 3v3" />
    </>,
  ),
  Clock: make(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>),
  DocText: make(
    <>
      <path d="M6 2.5h8l5 5V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" />
      <path d="M13.5 2.5V8H19M8.5 12.5h7M8.5 16h7" />
    </>,
  ),
  Chat: make(
    <>
      <path d="M4 5.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3.5V16.5H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>,
  ),
  Sparkle: make(
    <>
      <path d="M12 3c.4 3.6 1.4 4.6 5 5-3.6.4-4.6 1.4-5 5-.4-3.6-1.4-4.6-5-5 3.6-.4 4.6-1.4 5-5Z" />
      <path d="M18.5 13.5c.2 1.7.7 2.2 2.5 2.5-1.8.2-2.3.8-2.5 2.5-.2-1.7-.7-2.2-2.5-2.5 1.8-.3 2.3-.8 2.5-2.5Z" />
    </>,
  ),
  Receipt: make(
    <>
      <path d="M6 2.5h12v19l-3-1.8L12 21l-3-1.3L6 21.5V2.5Z" />
      <path d="M9 7h6M9 10.5h6M9 14h4" />
    </>,
  ),
  Shield: make(
    <>
      <path d="M12 2.5 20 5v6c0 5-3.4 8.6-8 10.5C7.4 19.6 4 16 4 11V5l8-2.5Z" />
      <path d="m8.8 11.5 2.2 2.2 4.2-4.4" />
    </>,
  ),
  Chart: make(
    <>
      <path d="M4 4v16h16" />
      <path d="M8 15v-3M12 15V8M16 15v-6" />
    </>,
  ),
  Settings: make(
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" />
    </>,
  ),
  Bell: make(
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>,
  ),
  Logout: make(<><path d="M14 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8" /><path d="M17 8l4 4-4 4M9 12h12" /></>),
  Check: make(<path d="m5 12.5 4.5 4.5L19 6.5" />),
  ArrowRight: make(<path d="M5 12h14M13 6l6 6-6 6" />),
  Plus: make(<path d="M12 5v14M5 12h14" />),
  Search: make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  Briefcase: make(
    <>
      <rect x="3" y="7.5" width="18" height="13" rx="2.5" />
      <path d="M8.5 7.5V5.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M3 13h18" />
    </>,
  ),
  Target: make(<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>),
  Heart: make(
    <path d="M12 20s-7-4.3-9.2-8.5C1.3 8.7 3 5.5 6.2 5.5c2 0 3.3 1.2 3.8 2.3.5-1.1 1.8-2.3 3.8-2.3 3.2 0 4.9 3.2 3.4 6C19 15.7 12 20 12 20Z" />,
  ),
  Leaf: make(
    <>
      <path d="M20 4C9 4 4 9 4 18c0 0 0 2 2 2 9 0 14-5 14-16Z" />
      <path d="M4 20C8 14 12 11 18 8" />
    </>,
  ),
  Lock: make(
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </>,
  ),
  Bolt: make(<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />),
  Menu: make(<path d="M4 7h16M4 12h16M4 17h16" />),
  Close: make(<path d="M6 6l12 12M18 6 6 18" />),
  User: make(<><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>),
  Download: make(<><path d="M12 3v12M7 11l5 5 5-5" /><path d="M4 20h16" /></>),
  Clipboard: make(
    <>
      <rect x="5" y="4.5" width="14" height="17" rx="2.5" />
      <path d="M9 4.5V3.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 3.5v1M9 11h6M9 15h4" />
    </>,
  ),
  Warning: make(<><path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5M12 17h.01" /></>),
};

export type IconName = keyof typeof Icon;
