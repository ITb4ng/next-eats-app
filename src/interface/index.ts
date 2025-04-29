export interface StoreType {
    id      : number;
    phone?  : string | null;
    address?: string | null;
    lat?    : number;
    lng?    : number;
    name?   : string | null;
    category?: string | null;
    storeType?: string | null;
    foodCertifyName?: string | null;
}

export interface StoreApiResponse {
    data       : StoreType[];
    totalPage? : number;
    totalCount?: number;
    page?      : number;
}

export interface LocationType {
    lat?: number | null;
    lng?: number | null;
    zoom?: number;
}

export interface SearchType {
    q?: string;
    district?: string;
  }