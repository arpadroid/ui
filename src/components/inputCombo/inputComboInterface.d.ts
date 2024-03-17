import { PlaceToolOptionsInterface } from '@arpadroid/tools/dist/types';

export interface InputComboInterface {
    closeOnBlur?: boolean;
    closeOnClick?: boolean;
    hasToggle?: boolean;
    isActive?: boolean;
    position?: PlaceToolOptionsInterface;
    onOpen?: () => void;
    onClose?: () => void;
    containerSelector?: string;
}
