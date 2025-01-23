/**
 * @typedef {import('@arpadroid/tools').PlaceToolOptionsType} PlaceToolOptionsType
 */

import { PlaceToolOptionsType } from '@arpadroid/tools';

export type InputComboConfigType = {
    closeOnBlur?: boolean;
    closeOnClick?: boolean;
    hasToggle?: boolean;
    isActive?: boolean;
    position?: PlaceToolOptionsType;
    onOpen?: () => void;
    onClose?: () => void;
    containerSelector?: string;
};
