import { PagerUpdateCallbackType } from '../../pager.types';

export type PagerItemConfigType = {
    className?: string;
    isActive?: boolean;
    hasInput?: boolean;
    urlParam?: string;
    ariaLabel?: string;
    page?: number;
    container?: HTMLElement;
    onClick?: (page: number) => void;
    content?: string;
    id?: string;
    onUpdate?: PagerUpdateCallbackType;
};
