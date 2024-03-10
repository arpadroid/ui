// import { NodePositionInterface } from "../../utils/nodePositionInterface";


export interface InputComboInterface {
    closeOnBlur?: boolean;
    closeOnClick?: boolean;
    hasToggle?: boolean;
    isActive?: boolean;
    position?: Record<string, unknown>;
    onOpen?: () => void;
    onClose?: () => void;
    containerSelector?: string;
}