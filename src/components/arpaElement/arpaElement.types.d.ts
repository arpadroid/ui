import { ZoneFilterType } from '../../tools/zoneTool.types';

export type TemplateContentMode = 'add' | 'content' | 'prepend' | 'append' | 'list-item' | 'view';

export type TemplatesType = Record<TemplateContentMode, HTMLTemplateElement> | Record<string, never>;

export type TemplateContainerConfigType = Element | string | (() => Element);

export type ArpaElementTemplateType = HTMLTemplateElement & {
    _container?: TemplateContainerConfigType;
};

export type SetTemplateConfigType = {
    container?: TemplateContainerConfigType;
    type?: TemplateContentMode;
};

export type ApplyTemplateConfigType = {
    container?: TemplateContainerConfigType;
    applyAttributes?: boolean;
    templateMode?: TemplateContentMode;
};

export type ArpaElementContentType =
    | string
    | HTMLElement
    | HTMLCollection
    | (() => string | HTMLElement | HTMLCollection);

export type ArpaElementAttributesType = Record<string, unknown> | (() => Record<string, unknown>);

export type ArpaElementConfigType = {
    content?: ArpaElementContentType;
    removeEmptyZoneNodes?: boolean;
    className?: string;
    variant?: string;
    classNames?: string[];
    attributes?: Record<string, string>;
    zoneSelector?: string;
    zoneResolverSelector?: string;
    zoneFilter?: ZoneFilterType;
    template?: string;  
    templates?: TemplatesType;
    templateContainer?: HTMLElement | string;
    templateTypes?: TemplateContentMode[];
    templateChildren?: Record<string, ArpaElementChildOptionsType> | undefined;
};

export type ArpaElementChildOptionsType = {
    tag?: string;
    attr?: ArpaElementAttributesType | (() => ArpaElementAttributesType);
    id?: string;
    className?: string;
    content?: ArpaElementContentType;
    hasZone?: boolean;
    zoneName?: string;
    propName?: string;
    canRender?: ((component: unknown) => boolean) | boolean | string;
};
