import type { PagerItem } from './pager';

export type PagerConfigType = {
    id?: string;
    className?: string;
    currentPage?: number;
    itemComponent?: string;
    totalPages?: number;
    maxNodes?: number;
    hasArrowControls?: boolean;
    adjustSelectedPosition?: boolean;
    urlParam?: string;
    ariaLabel?: string;
    renderMode?: 'default' | 'minimal';
    hasInput?: boolean;
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
