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
    attributes?: Record<string, string>;
    className?: string;
    classNames?: string[];
    content?: ArpaElementContentType;
    handleContent?: boolean;
    template?: string;
    templateChildren?: Record<string, ArpaElementChildOptionsType> | undefined;
    templateContainer?: HTMLElement | string;
    templates?: TemplatesType;
    templateTypes?: TemplateContentMode[];
    templateVars?: Record<string, unknown> | (() => Record<string, unknown>);
    variant?: string;
    zoneFilter?: ZoneFilterType;
    zoneResolverSelector?: string;
    zoneSelector?: string;
};

export type ArpaElementChildOptionsType = {
    attr?: ArpaElementAttributesType | (() => ArpaElementAttributesType);
    canRender?: ((component: unknown) => boolean) | boolean | string;
    className?: string;
    content?: ArpaElementContentType;
    hasZone?: boolean;
    id?: string;
    isContent?: boolean;
    propName?: string;
    tag?: string;
    zoneName?: string;
};
