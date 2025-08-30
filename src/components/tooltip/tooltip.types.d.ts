import { ArpaElementConfigType } from '../arpaElement/arpaElement.types';

export type TooltipConfigType = ArpaElementConfigType & {
    handler?: string | HTMLElement;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'cursor';
    cursorPositionAxis?: 'x' | 'y';
    hasCursorPosition?: boolean;
    cursorTooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    text?: string;
    icon?: string;
    label?: string;
    onMouseTargetUpdate?: (target: HTMLElement, event: MouseEvent | TouchEvent) => void;
};
