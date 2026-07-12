import { ArpaNodeConfigType } from '../arpaNode/arpaNode.types';
import ArpaElement, { ArpaNode } from './arpaElement';

export type ArpaElementConfigType = {
    attributes?: Record<string, string>;
    blueprint?: ArpaElementBluePrintType;
    className?: string;
    classNames?: (string | (() => string))[];
    content?: ArpaElementContentType;
    contentPosition?: 'prepend' | 'append' | 'top' | 'replace' | 'bottom';
    eventHandlerSelector?: string;
    handleContent?: boolean;
    nodesConfig?: Record<string, ArpaNodeConfigType> | undefined;
    template?: ArpaElementBluePrintType;
    templateContainer?: HTMLElement | string;
    templates?: TemplatesType;
    templateTypes?: TemplateContentMode[];
    templateVars?: Record<string, unknown> | (() => Record<string, unknown>);
    variant?: string;
};

export type ArpaElementBluePrintType = string | (() => string);

export type ArpaElementContentNodeType = ArpaElement | HTMLElement | ArpaNode | Element;

export type ArpaElementNodeType = ArpaElementContentNodeType | HTMLElement | Node | DocumentFragment;

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
