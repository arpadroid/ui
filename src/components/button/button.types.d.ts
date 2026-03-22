import { ArpaElementConfigType } from '../arpaElement/arpaElement.types';

export type ButtonConfigType = ArpaElementConfigType & {
    icon?: string;
    rhsIcon?: string;
    content?: string;
    variant?:
        | 'primary'
        | 'primary-outlined'
        | 'secondary'
        | 'secondary-outlined'
        | 'tertiary'
        | 'tertiary-outlined'
        | 'delete'
        | 'submit';
    type?: 'button' | 'submit' | 'reset';
    label?: string;
    buttonClass?: string;
    buttonZone?: string;
    tooltip?: string;
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    disabled?: boolean;
};
