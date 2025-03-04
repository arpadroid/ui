// import { ZoneType } from '@arpadroid/tools';

export type ArpaElementConfigType = {
    removeEmptyZoneNodes?: boolean;
    className?: string;
    variant?: string;
    classNames?: string[];
    attributes?: Record<string, string>;
    zoneSelector?: string;
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
