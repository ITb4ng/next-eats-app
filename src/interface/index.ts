export interface StoreType {
    id                  : number;
    lat?                : number;
    lng?                : number;
    name?               : string | null;
    likes?              : LikeInterface[];
    phone?              : string | null;
    isLiked?            : boolean;
    address?            : string | null;
    category?           : string | null;
    storeType?          : string | null;
    foodCertifyName?    : string | null;
}

export interface LikeInterface {
    user?       : UserType;  // 'any' -> 'UserType'로 변경
    id          : number;
    storeId     : number;
    userId      : number;
    store?      : StoreType;
}

export interface LikeApiResponse {
    data        : LikeInterface[];
    totalPage?  : number;
    totalCount? : number;
    page?       : number;
}

export interface StoreApiResponse {
    data       : StoreType[];
    totalPage? : number;
    totalCount?: number;
    page?      : number;
}

export interface LocationType {
    lat?     : number | null;
    lng?     : number | null;
    zoom?    : number;
}

export interface SearchType {
    q?          : string;
    district?   : string;
}

interface UserType {
    id       : number;
    email    : string;
    name?    : string | null;
    image?   : string | null;
}

export interface CommentInterface {
    id          : number;
    storeId     : number;
    userId      : number;
    store?      : StoreType;
    body?       : string;
    user?       : UserType;
    createdAt   : Date;
}

export interface CommentApiResponse {
    data        : CommentInterface[];
    totalPage?  : number;
    page?       : number;
    totalCount  : number;
}
