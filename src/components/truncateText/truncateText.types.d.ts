import { ArpaElementConfigType } from '../core/arpaElement/arpaElement';

export type TruncateTextConfigType = ArpaElementConfigType & {
    buttonClasses?: string[];
    contentClass?: string;
    ellipsis?: string;
    hasButton?: boolean;
    icon?: string;
    iconHide?: string;
    inlineLayout?: boolean;
    isTruncated?: boolean;
    lblHide?: string;
    lblShow?: string;
    maxLength?: number;
};
