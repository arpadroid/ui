import { ArpaElementConfigType } from '../arpaElement/arpaElement';
export type TruncateTextConfigType = ArpaElementConfigType & {
    maxLength?: number;
    threshold?: number;
    ellipsis?: string;
    readMoreLabel?: string;
    readLessLabel?: string;
    buttonClasses?: string[];
    hasReadMoreButton?: boolean;
    hasButton?: boolean;
    contentClass?: string;
};
