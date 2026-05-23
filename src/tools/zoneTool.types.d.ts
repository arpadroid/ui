import ArpaElement from '../components/arpaElement/arpaElement';

export type ZoneToolPlaceZoneType = {
    nodes?: NodeList;
    zoneName?: string | null;
    zoneComponent?: ArpaElement | null | undefined;
    zoneContainer?: Element | null | undefined;
    zone?: ZoneType;
};

export type ZoneToolConfigType = HTMLElement & {
    _parentNode?: ParentNode | null;
    _parentTag?: string | null;
    name: string;
    _onPlaceZone?: (zone: ZoneToolPlaceZoneType) => void;
};

export type ZoneType = ZoneToolConfigType;

export type ZoneFilterType = (zones: ZoneType[], component: ArpaElement) => ZoneType[];
