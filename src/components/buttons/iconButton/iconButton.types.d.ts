import { ButtonConfigType } from '../button/button.types';

export type IconButtonConfigType = ButtonConfigType & {
    label?: string;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'delete';
};
