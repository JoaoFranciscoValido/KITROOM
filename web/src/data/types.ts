export type Avail = 'in' | 'low' | 'req';
export type ProductType = 'Shirt' | 'Shorts' | 'Jacket' | 'Training' | 'Casual';
export type Variant =
  | 'Fan version' | 'Player version' | 'Special edition' | 'Retro' | 'Long sleeve' | 'Kids' | "Women's" | 'Goalkeeper';

/** Drives the illustrated placeholder when a product has no photos. */
export interface Kit {
  p: 'solid' | 'stripes' | 'hoops' | 'sleeves' | 'halves' | 'sash' | 'yoke';
  c: string[];
  trim: string;
  ink: string;
}

export interface Product {
  id: string;
  /** Original album title in the supplier catalogue; never shown to customers. */
  album: string;
  name: string;
  team: string;
  league: string;
  country: string;
  season: string;
  /** Website category key (see `categories`). */
  cat: string;
  variant: Variant;
  type: ProductType;
  av: Avail;
  sizes: string[];
  /** Sizes currently unavailable (rendered struck through). */
  out?: string[];
  /** Self-hosted photo URLs for the gallery. */
  images: string[];
  /** Smaller cover photo for cards and thumbnails (defaults to the first gallery photo). */
  cover?: string;
  /** Description written by the seller; generated from the product data when empty. */
  description?: string;
  kit: Kit;
  /** Supplier album category; reference only. */
  src: string;
  /** Photo count in the supplier album; reference only. */
  photos?: number;
}

export interface Category {
  key: string;
  label: string;
  desc: string;
  /** Album title fragment of the product used as the category's thumbnail. */
  rep: string;
  /** Supplier album categories merged into this one; reference only. */
  sources: string[];
}

export interface League {
  key: string;
  desc: string;
  rep: string;
}
