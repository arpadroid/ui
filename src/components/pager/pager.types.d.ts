import type { PagerItem } from './pager';

export type PagerConfigType = {
    id?: string;
    className?: string;
    currentPage?: number;
    totalPages?: number;
    maxNodes?: number;
    hasArrowControls?: boolean;
    urlParam?: string;
    ariaLabel?: string;
    renderMode?: 'default' | 'minimal';
    onClick?: (payload: PagerCallbackPayloadType) => void;
};

export type PagerCallbackPayloadType = {
    page?: number | string;
    node?: PagerItem | null;
    event?: Event;
};

export type PagerUpdateCallbackType = (payload: {
    node: HTMLElement & PagerItem;
    isCurrent: boolean;
}) => void;
