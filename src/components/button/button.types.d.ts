import { ArpaElementConfigType } from '../arpaElement/arpaElement.types';

export type ButtonConfigType = ArpaElementConfigType & {
    icon?: string;
    rhsIcon?: string;
    content?: string;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'delete' | 'submit';
    type?: 'button' | 'submit' | 'reset';
    labelText?: string;
    buttonClass?: string;
    tooltip?: string;
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
};
