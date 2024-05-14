import { AbstractContentInterface } from '../../../../types';
import { ListResource } from '@arpadroid/application';

export interface ListInterface extends AbstractComponentInterface {
    isCollapsed?: boolean;
    canCollapse?: boolean;
    hasSearch?: boolean;
    hasPager?: boolean;
    listResource?: ListResource;
    heading?: string;
    onSearch?: (value: string) => void;
    filters?: AbstractContentInterface;
}
