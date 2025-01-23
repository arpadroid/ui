import { ArpaElementConfigType } from '../arpaElement/arpaElement';

export type DropAreaConfigType = ArpaElementConfigType & {
    fileInput?: HTMLInputElement;
    onDrop?: (files: FileList) => void;
};
