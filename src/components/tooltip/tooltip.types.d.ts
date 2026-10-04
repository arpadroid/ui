import { ArpaElementConfigType } from '../core/arpaElement/arpaElement.types';

export type TooltipConfigType = ArpaElementConfigType & {
    handler?: string | HTMLElement;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'cursor' | string;
    cursorPositionAxis?: 'x' | 'y';
    hasCursorPosition?: boolean;
    cursorTooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    icon?: string;
    label?: string;
    onMouseTargetUpdate?: (target: HTMLElement, event: Event) => void;
};
