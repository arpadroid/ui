import { ArpaElementConfigType } from "../../core/arpaElement/arpaElement.types";

export type CircularSpinnerConfigType  = ArpaElementConfigType & {
    hasMask?: boolean;
    variant?: 'primary' | 'secondary' | 'tertiary';
    size?: 'mini' | 'small' | 'medium' | 'large' | 'x-large';
    thickness?: 'thin' | 'medium' | 'thick';
    label?: string;
}
