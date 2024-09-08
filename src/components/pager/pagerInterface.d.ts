export type PagerType = {
    className?: string;
    currentPage?: number;
    totalPages: number;
    maxNodes?: number;
    hasArrowControls?: boolean;
    urlParam?: string;
    ariaLabel?: string;
};
