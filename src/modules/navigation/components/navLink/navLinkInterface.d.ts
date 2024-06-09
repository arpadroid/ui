import { ListItemInterface } from '../../../../types';

export interface NavLinkInterface extends ListItemInterface {
    url?: string;
    action?: () => void;
}
