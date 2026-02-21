import ArpaElement from '../components/arpaElement/arpaElement';

export type ZoneToolPlaceZoneType = {
    nodes?: NodeList;
    zoneName?: string | null;
    zoneComponent?: ArpaElement | null | undefined;
    zoneContainer?: Element | null | undefined;
    zone?: ZoneType;
};

export type ZoneType = HTMLElement & {
    _parentNode?: ParentNode | null;
    _parentTag?: string | null;
    name: string;
    _onPlaceZone?: (zone: ZoneToolPlaceZoneType) => void;
};

export type ComponentType = HTMLElement & {
    _parentNode?: ParentNode | null;
    _onPlaceZone?: (zone: ZoneToolPlaceZoneType) => void;
    getProperty: (name: string) => string | null | undefined;
    getClassName: () => string;
    _zones?: Set<ZoneType>;
    zonesByName?: Set<string>;
    hasContent: (name: string) => boolean;
    originalContent?: string;
    _hasRendered?: boolean;
    _lastRendered?: number;
    _config?: Record<string, unknown>;
};

export type ZoneFilterType = (zones: ZoneType[], component: ArpaElement) => ZoneType[];
