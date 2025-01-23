import type { PagerItem } from "./pager";


export type PagerConfigType = {
    className?: string;
    currentPage?: number;
    totalPages?: number;
    maxNodes?: number;
    hasArrowControls?: boolean;
    urlParam?: string;
    ariaLabel?: string;
    renderMode?: 'default' | 'minimal';
};

export type PagerUpdateCallbackType = (payload: { node: HTMLElement & PagerItem; isCurrent: boolean }) => void;
