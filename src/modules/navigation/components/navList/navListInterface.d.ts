import List from '../../../list/components/list/list.js';
import { NavLinkInterface } from '../navLink/navLinkInterface.js';

export interface NavListInterface extends List {
    variant?: 'horizontal' | 'vertical';
    divider?: string;
    links?: NavLinkInterface[];
}
