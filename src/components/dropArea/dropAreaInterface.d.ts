export interface DropAreaInterface {
    fileInput: HTMLInputElement;
    onDrop?: (files: FileList) => void;
}
