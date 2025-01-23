import { ArpaElementConfigType } from '../arpaElement/arpaElement.types';
import ImageComponent from './image.js';

export interface ImageSourceInterface {
    src: string;
    width?: number;
    height?: number;
}

export interface ImageSourcesInterface {
    default?: string;
    small?: string;
    medium?: string;
    large?: string;
    xlarge?: string;
}

export type ImageConfigType = ArpaElementConfigType & {
    sources?: ImageSourcesInterface;
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    icon?: string;
    caption?: string;
    showPreloader?: boolean;
    lazyLoad?: boolean;
    onLoad?: (event: Event, image: ImageComponent) => void;
    onError?: (event: Event, image: ImageComponent) => void;
    onInput: (files: File[], event: Event, image: ImageComponent) => void;
};
