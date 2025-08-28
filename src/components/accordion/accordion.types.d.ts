export type AccordionConfigType = {
    closeAllOnOpen?: boolean;
    contentSelector?: string;
    expandAll?: boolean;
    handlerSelector?: string;
    isCollapsed?: boolean;
    itemSelector?: string;
    onHandlerClick?: (item: HTMLElement, isOpen: boolean) => void | undefined;
    onClose?: (item: HTMLElement, handler: HTMLElement | null) => void | undefined;
    onOpen?: (item: HTMLElement, handler: HTMLElement | null) => void | undefined;
    openClass?: string;
};
