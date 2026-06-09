import { CircularSpinnerConfigType } from '../circularSpinner/circularSpinner.types';

export type CircularProgressConfigType = CircularSpinnerConfigType & {
    progress?: number;
};
