import ArpaElement  from '../arpaElement/arpaElement.js';
import { ArpaElementContentType } from '../arpaElement/arpaElement.types';

export type ArpaNodeAttributesType = Record<string, unknown> | (() => Record<string, unknown>);

export type ArpaNodeConfigType = {
    attr?: ArpaNodeAttributesType;
    arpaElement?: ArpaElement;
    canRender?: boolean | string | ((component: unknown) => boolean | string);
    childNodes?: Node[];
    className?: string;
    content?: ArpaElementContentType;
    defer?: string | boolean;
    hasZone?: boolean | 'false';
    id?: string;
    isContent?: boolean;
    name?: string;
    tag?: keyof HTMLElementTagNameMap | 'fragment' | string;
    zoneName?: string;
    allowDisconnectedInitialization?: boolean;
    zoneTarget?: string;
    locator?: {
        parentNode: Node | null;
        previousSibling: Node | null;
        nextSibling: Node | null;
    };
};
