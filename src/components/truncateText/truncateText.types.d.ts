import { ArpaElementConfigType } from '../core/arpaElement/arpaElement';

export type TruncateTextConfigType = ArpaElementConfigType & {
    buttonClasses?: string[];
    contentClass?: string;
    ellipsis?: string;
    hasButton?: boolean;
    isTruncated?: boolean;
    maxLength?: number;
    readLessLabel?: string;
    readMoreLabel?: string;
    threshold?: number;
};
