import { ArpaElementContentType } from '../arpaElement/arpaElement.types';

export type ArpaNodeAttributesType = Record<string, unknown> | (() => Record<string, unknown>);

export type ArpaNodeConfigType = {
    attr?: ArpaNodeAttributesType;
    className?: string;
    canRender?: ((component: unknown) => boolean) | boolean | string;
    content?: ArpaElementContentType;
    hasZone?: boolean;
    id?: string;
    isContent?: boolean;
    name?: string;
    tag?: string;
    zoneName?: string;
    childNodes?: ChildNode[];
};
