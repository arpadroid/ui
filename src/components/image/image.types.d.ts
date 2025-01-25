import { ArpaElementConfigType } from '../arpaElement/arpaElement.types';
import ImageComponent from './image.js';

export interface ImageSourceType {
    src: string;
    width?: number;
    height?: number;
}

export interface ImageSourcesType {
    default?: string;
    small?: string;
    medium?: string;
    large?: string;
    xlarge?: string;
}

export type ImageConfigType = ArpaElementConfigType & {
    sources?: ImageSourcesType;
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
} | Record<string, unknown>;
