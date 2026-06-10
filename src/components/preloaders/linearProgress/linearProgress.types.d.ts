import { CircularSpinnerConfigType } from '../circularSpinner/circularSpinner.types';

export type LinearProgressConfigType = CircularSpinnerConfigType & {
    progress?: number;
};