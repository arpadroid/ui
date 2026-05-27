import { ArpaElementConfigType } from '../core/arpaElement/arpaElement';

export type DropAreaConfigType = ArpaElementConfigType & {
    fileInput?: HTMLInputElement;
    onDrop?: (files: FileList) => void;
};
