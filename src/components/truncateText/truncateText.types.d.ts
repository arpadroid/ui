import { ArpaElementConfigType } from '../core/arpaElement/arpaElement';
export type TruncateTextConfigType = ArpaElementConfigType & {
    maxLength?: number;
    threshold?: number;
    ellipsis?: string;
    readMoreLabel?: string;
    readLessLabel?: string;
    buttonClasses?: string[];
    hasReadMoreButton?: boolean;
    contentClass?: string;
};
