import { IconButtonConfigType } from '../iconButton/iconButton.types';

export type DarkModeButtonConfigType = IconButtonConfigType & {
    icon?: string;
    iconLight?: string;
    labelText?: string;
    label?: string;
    tooltip?: string;
    labelLight?: string;
};
