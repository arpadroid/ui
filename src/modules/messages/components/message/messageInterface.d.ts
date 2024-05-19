import { ListItemInterface } from '../../../list/components/listItem/listItemInterface';

export interface MessageInterface extends ListItemInterface {
    text?: string;
    timeout?: number;
    canClose?: boolean;
    closeLabel?: string;
    icon?: string;
    truncateContent?: boolean;
    onClose?: () => void;
}
