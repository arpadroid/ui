import { ZoneFilterType } from '../../../tools/zoneTool.types';
import { ArpaNodeConfigType } from '../arpaNode/arpaNode.types';

export type ArpaElementConfigType = {
    attributes?: Record<string, string>;
    className?: string;
    classNames?: string[];
    content?: ArpaElementContentType;
    contentPosition?: 'prepend' | 'append' | 'top' | 'replace' | 'bottom';
    handleContent?: boolean;
    template?: string;
    nodesConfig?: Record<string, ArpaNodeConfigType> | undefined;
    templateContainer?: HTMLElement | string;
    templates?: TemplatesType;
    templateTypes?: TemplateContentMode[];
    templateVars?: Record<string, unknown> | (() => Record<string, unknown>);
    variant?: string;
    zoneFilter?: ZoneFilterType;
    zoneResolverSelector?: string;
    zoneSelector?: string;
};

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
