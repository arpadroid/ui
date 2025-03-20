import { ArpaElementConfigType } from '../arpaElement/arpaElement.types';
import { ButtonConfigType } from '../button/button.types';

export type IconButtonConfigType = ArpaElementConfigType & {
    label?: string;
    type?: ButtonConfigType['type'];
    icon?: ButtonConfigType['icon'];
    variant?: 'primary' | 'secondary' | 'tertiary' | 'delete';
    tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
    tooltip?: string;
};
