import { ArpaElementConfigType } from '../arpaElement/arpaElement.types';
import Button from './button';

export type ButtonConfigType = ArpaElementConfigType & {
    buttonClass?: string;
    buttonZone?: string;
    content?: string;
    disabled?: boolean;
    icon?: string;
    label?: string;
    rhsIcon?: string;
    tooltip?: string;
    '@onClick'?: (buttonInstance: Button) => void;
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    type?: 'button' | 'submit' | 'reset';
    variant?:
        | 'default'
        | 'primary'
        | 'primary-outlined'
        | 'secondary'
        | 'secondary-outlined'
        | 'tertiary'
        | 'tertiary-outlined'
        | 'delete'
        | 'delete-outlined'
        | 'submit'
        | 'submit-outlined'
        | 'highlight'
        | 'highlight-outlined'
};
