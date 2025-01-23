import { ArpaElementConfigType } from '../arpaElement/arpaElement.types';
import { ButtonType } from '../button/button.types';

export type IconButtonConfigType = ArpaElementConfigType & {
    label?: string;
    type?: ButtonType['type'];
    icon?: ButtonType['icon'];
    variant?: 'primary' | 'secondary' | 'tertiary' | 'delete';
    tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
    tooltip?: string;
};
