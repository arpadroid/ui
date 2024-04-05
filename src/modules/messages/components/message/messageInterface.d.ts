import { ListItemInterface } from '../../../list/components/listItem/listItemInterface';

export interface MessageInterface extends ListItemInterface {
    text?: string;
    timeout?: number;
    canClose?: boolean;
    onClose?: () => void;
}
