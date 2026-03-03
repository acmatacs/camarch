// Shared TypeScript types for the CamArch platform

export interface Province {
  id: number;
  name: string;
  description?: string | null;
}

export interface King {
  id: number;
  name: string;
  reignStart?: number | null;
  reignEnd?: number | null;
  description?: string | null;
}

export interface Style {
  id: number;
  name: string;
  period?: string | null;
}

export interface Era {
  id: number;
  name: string;
}

// Lightweight temple used in listings, map, carousels
export interface TempleSummary {
  id: number;
  slug: string;
  name: string;
  khmerName?: string | null;
  featuredImage: string;
  yearBuilt?: number | null;
  religion?: string | null;
  province: { id: number; name: string };
  era?: { id: number; name: string } | null;
  style?: { id: number; name: string } | null;
  king?: { id: number; name: string } | null;
}

// Full temple with all relations — used in detail page
export interface TempleDetail extends TempleSummary {
  description: string;
  history?: string | null;
  latitude: number;
  longitude: number;
  galleryImages: string[];
  createdAt: string;
  updatedAt: string;
  king?: King | null;
  style?: Style | null;
  era?: Era | null;
  province: Province;
}

// Map pin data (minimal)
export interface MapTemple {
  id: number;
  slug: string;
  name: string;
  khmerName?: string | null;
  latitude: number;
  longitude: number;
  featuredImage: string;
  yearBuilt?: number | null;
  religion?: string | null;
  province: { name: string };
  era?: { name: string } | null;
  style?: { name: string } | null;
}

// API response wrappers
export interface TemplesResponse {
  data: TempleSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TempleDetailResponse {
  data: TempleDetail;
  nearby: TempleSummary[];
}

export interface MapResponse {
  data: MapTemple[];
}

export interface FiltersResponse {
  provinces: Province[];
  eras: Era[];
  styles: Style[];
  kings: King[];
}
