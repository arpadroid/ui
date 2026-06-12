import { ArpaElementContentType } from '../arpaElement/arpaElement.types';

export type ArpaNodeAttributesType = Record<string, unknown> | (() => Record<string, unknown>);

export type ArpaNodeConfigType = {
    attr?: ArpaNodeAttributesType;
    canRender?: boolean | string | ((component: unknown) => boolean | string);
    childNodes?: Node[];
    className?: string;
    content?: ArpaElementContentType;
    hasZone?: boolean;
    id?: string;
    isContent?: boolean;
    name?: string;
    tag?: keyof HTMLElementTagNameMap | 'fragment' | string;
    zoneName?: string;
    zoneTarget?: string;
};
