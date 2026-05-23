import { ArpaElementConfigType } from '../arpaElement/arpaElement.types';
import ImageComponent from './image.js';

export type ImageSizeOptionsType =
    | 'mini'
    | 'xx_small'
    | 'x_small'
    | 'small'
    | 'medium'
    | 'big'
    | 'large'
    | 'x_large'
    | 'xx_large'
    | 'huge'
    | 'adaptive';

export type ImageConfigType = ArpaElementConfigType & {
    alt?: string;
    caption?: string;
    defaultSize?: ImageSizeOptionsType;
    dropAreaHandler?: HTMLElement;
    errLoad?: string;
    errorClass?: string;
    lblLoadingImage?: string;
    loadingClass?: string;
    txtNoImage?: string;
    txtUploadImage?: string;
    hasNativeLazy?: boolean;
    hasPreloader?: boolean;
    hasPreview?: boolean;
    hasDropArea?: boolean;
    hasThumbnail?: boolean;
    height?: number;
    highResSrc?: string;
    icon?: string;
    iconBroken?: string;
    isDraggable?: boolean;
    imageAttr?: Record<string, string>;
    imagePosition?: string;
    lazyLoad?: boolean;
    lazyLoaderBatchSize?: number;
    loadedClass?: string;
    onError?: (event: Event, image: ImageComponent) => void;
    onInput?: (files: File[], event: Event, image: ImageComponent) => void;
    onLoad?: (event?: Event, image?: ImageComponent) => void;
    params?: string[];
    preventUpscale?: boolean;
    previewTitle?: string;
    quality?: number;
    showPreloader?: boolean;
    sizeMap?: Record<ImageSizeOptionsType, number | string>;
    sizes?: ImageSizeOptionsType[];
    size?: ImageSizeOptionsType | number;
    sources?: ImageSourcesType;
    src?: string;
    width?: number;
};

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
