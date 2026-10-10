import type { SVGProps } from 'react';

type P = { size?: number; color?: string; sw?: number } & Omit<SVGProps<SVGSVGElement>, 'color'>;

const base = (size: number, rest: SVGProps<SVGSVGElement>) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, ...rest,
});

const HEART = 'M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z';

export const BackIcon = ({ size = 22, color = '#111', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
);
export const SearchIcon = ({ size = 19, color = '#111', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
);
export const HeartIcon = ({ size = 19, color = '#111', sw = 1.8, fill = 'none', ...r }: P) => (
  <svg {...base(size, r)} fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round"><path d={HEART} /></svg>
);
export const BagIcon = ({ size = 19, color = '#111', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
    <path d="M5.5 8.5h13l-1.1 11.2a1.5 1.5 0 0 1-1.5 1.3H8.1a1.5 1.5 0 0 1-1.5-1.3z" /><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
  </svg>
);
export const ArrowRightIcon = ({ size = 16, color = '#111', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ChevronRightIcon = ({ size = 18, color = '#111', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
);
export const FilterIcon = ({ size = 17, color = '#111', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinecap="round">
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" />
  </svg>
);
export const CloseIcon = ({ size = 16, color = '#111', sw = 2, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const PlusIcon = ({ size = 16, color = '#111', sw = 2, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
);
export const MinusIcon = ({ size = 16, color = '#111', sw = 2, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinecap="round"><path d="M5 12h14" /></svg>
);
export const CameraIcon = ({ size = 17, color = '#111', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="14" rx="2.5" /><circle cx="12" cy="13" r="3.5" /><path d="M9 6l1.5-2h3L15 6" />
  </svg>
);
export const EditIcon = ({ size = 15, color = '#111', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
);
export const TrashIcon = ({ size = 15, color = '#c4321f', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" /></svg>
);
export const HomeIcon = ({ size = 21, color = '#111', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" /></svg>
);
export const GridIcon = ({ size = 20, color = '#111', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
);
export const ListIcon = ({ size = 21, color = '#111', sw = 1.8, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinecap="round"><path d="M4 6.5h16M4 12h16M4 17.5h10" /></svg>
);
export const CheckIcon = ({ size = 30, color = '#111', sw = 2.2, ...r }: P) => (
  <svg {...base(size, r)} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const ReadTicks = () => (
  <svg width="17" height="11" viewBox="0 0 17 11" fill="none" stroke="#53bdeb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M1 6l3 3 6-7.5" /><path d="M7 9l1 0.5L14.5 1.5" />
  </svg>
);
