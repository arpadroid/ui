/**
 * @typedef {import('@arpadroid/tools').PlaceToolOptionsType} PlaceToolOptionsType
 */

import { PlaceToolOptionsType } from '@arpadroid/tools';
import InputCombo from './inputCombo';

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

export type InputComboNodeType = HTMLElement & { InputCombo?: InputCombo };
