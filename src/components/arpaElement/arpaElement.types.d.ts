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

export type ArpaElementAttributesType = Record<string, (string | boolean) | (() => (string | boolean))>;

export type ArpaElementChildOptionsType = {
    tag?: string;
    attr?: ArpaElementAttributesType | (() => ArpaElementAttributesType);
    id?: string;
    className?: string;
    content?: string | (() => string);
    hasZone?: boolean;
    zoneName?: string;
    propName?: string;
    canRender?: ((component: unknown) => boolean) | boolean | string;
};

export type ArpaElementConfigType = {
    removeEmptyZoneNodes?: boolean;
    className?: string;
    variant?: string;
    classNames?: string[];
    attributes?: Record<string, string>;
    zoneSelector?: string;
    zoneResolverSelector?: string;
    zoneFilter?: ZoneFilterType;
    templates?: TemplatesType;
    templateContainer?: HTMLElement | string;
    templateTypes?: TemplateContentMode[];
    templateChildren?: Record<string, ArpaElementChildOptionsType> | undefined;
};

// declare global {
//     interface HTMLElementTagNameMap {
//         'arpa-element': ArpaElement;
//     }

//     interface ArpaElementAttributes {
//         'remove-empty-zone-nodes'?: string;
//         'class-name'?: string;
//         variant?: string;
//         'class-names'?: string;
//     }
// }
