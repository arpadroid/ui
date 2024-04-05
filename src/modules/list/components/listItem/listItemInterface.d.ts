// import List from '../list/list.js';
// import DialogContext from '../../../dialog/contexts/dialogContext';
// import { IconMenuInterface } from '../../../navigation/components/iconMenu/iconMenu';
// import { TagInterface } from '../../../../components/tag/tagInterface';
import ListItem from './listItem.js';

export interface ListItemInterface {
    id?: string;
    link?: string;
    title?: string;
    titleLink?: string;
    titleIcon?: string;
    subTitle?: string;
    icon?: string;
    image?: string;
    imageAlt?: string;
    hasSelection?: boolean;
    // dialogContext?: DialogContext;
    // defaultImage?: string;
    nav?: IconMenuInterface;
    tags?: TagInterface[];
    onImageLoaded?: (event: Event, image: ListItem) => void;
    onImageError?: (event: Event, image: ListItem) => void;
}
