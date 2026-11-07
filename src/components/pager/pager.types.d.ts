import { ArpaElementConfigType } from '../../types';

export type PagerConfigType = ArpaElementConfigType & {
    ariaLabel?: string;
    className?: string;
    currentPage?: number | string;
    hasArrowControls?: boolean | 'false';
    hasInput?: boolean;
    id?: string;
    lblNextPage?: string;
    lblPrevPage?: string;
    maxNodes?: number | string;
    nextIcon?: string;
    onClick?: (payload: PagerCallbackPayloadType) => void;
    prevIcon?: string;
    spacerContent?: string;
    totalPages?: number | string;
    urlParam?: string;
};

export type PagerCallbackPayloadType = {
    page?: number | string;
    node?: HTMLElement | null;
    event?: Event;
};

export type PagerUpdateCallbackType = (payload: { node: HTMLElement; isCurrent: boolean }) => void;

export type PagerComputeResult = {
    start?: number;
    end?: number;
    totalPages: number;
    hasLeftSpacer?: boolean;
    hasRightSpacer?: boolean;
};
