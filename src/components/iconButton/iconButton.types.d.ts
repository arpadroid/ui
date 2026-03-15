import { ButtonConfigType } from 'src/types';

export type IconButtonConfigType = ButtonConfigType & {
    label?: string;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'delete';
};
