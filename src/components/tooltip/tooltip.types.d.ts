import { ArpaElementConfigType } from '../arpaElement/arpaElement.types';

export type TooltipConfigType = ArpaElementConfigType & {
    handler?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    text?: string;
    icon?: string;
    label?: string;
};
