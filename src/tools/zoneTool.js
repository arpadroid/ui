/**
 * @typedef {import('./zoneTool.types.js').ZoneToolPlaceZoneType} ZoneToolPlaceZoneType
 * @typedef {import('./zoneTool.types.js').ZoneType} ZoneType
 * @typedef {import('../components/arpaElement/arpaElement.js').default} ArpaElement
 */

import { debounce, throttle, appendNodes, attr, getAttributesWithPrefix } from '@arpadroid/tools';

/** @type {boolean} */
const VERBOSE = false;
/** @type {Set<ZoneType>} */
export const LOST_ZONES = new Set();
/** @type {Set<ZoneType>} */
export const ZONES = new Set();
/** @type {string} */
export const ZONE_SELECTOR = 'zone';
export const ZONE_INSERTION_INTERVAL = 10;
export const ZONE_BENCHMARK_INTERVAL = 500;
export const ZONES_LOADED_CALLBACKS = new Set();

let originalInsertSize = 0;

/**
 * Returns the zones in a nice printable format.
 * @param {Set<ZoneType> | ZoneType[]} [zones] - The zones to print.
 * @returns {Record<string, unknown>[]}
 */
export function getPrintableZones(zones = ZONES) {
    return Array.from(zones).map(zone => ({
        name: zone.getAttribute('name'),
        zoneHTML: zone.outerHTML,
        zoneText: zone.innerText,
        parentHTML: zone._parentNode
    }));
}

/**
 * Filters zones.
 * @param {ZoneType[]} zones - The zones to filter.
 * @param {ArpaElement} component
 * @param {import('./zoneTool.types.js').ZoneFilterType} [filter] - The filter function.
 * @returns {ZoneType[]} The filtered zones.
 */
export function filterZones(zones, component, filter = component._config?.zoneFilter) {
    if (typeof filter === 'function') {
        return filter(zones, component);
    }
    return zones;
}

/**
 * Retrieves the zone selector from a component.
 * @param {ArpaElement} component - The component to retrieve the zone selector from.
 * @returns {string} The zone selector.
 */
export function getSelector(component) {
    return /** @type {string} */ (component?.getProperty('zone-selector') || ZONE_SELECTOR);
}

/**
 * Selects all zones from a node.
 * @param {ArpaElement} node
 * @param {string} [selector]
 * @returns {ZoneType[]}
 */
export function selectZones(node, selector = getSelector(node)) {
    return filterZones(Array.from(node.querySelectorAll(selector)), node);
}

/**
 * Finds the component that owns a zone.
 * @param {ArpaElement} zone - The zone to search.
 * @returns {ArpaElement | undefined} The component that owns the zone.
 */
export function findNodeComponent(zone) {
    if (!zone) return;
    /** @type {ArpaElement | null} */
    let node = zone;
    while (node) {
        if (node?._zones instanceof Set) {
            return node;
        }
        node = /** @type {ArpaElement | null} */ (node.parentElement);
    }
}

/**
 * Returns the zone registry of a zone.
 * @param {ZoneType} zone - The zone to register.
 * @returns {string[]}
 */
export function getZoneRegistry(zone) {
    if (!(zone?._parentNode instanceof HTMLElement)) {
        return [];
    }
    return zone._parentNode.getAttribute('zone-registry')?.trim().split(',').filter(Boolean) || [];
}

/**
 * Adds a zone to the registry.
 * @param {ZoneType} zone - The zone to register.
 */
export function registerZoneInParentNode(zone) {
    if (!(zone?._parentNode instanceof HTMLElement)) {
        console.error('Zone has no parent:', zone);
        return;
    }
    const registry = getZoneRegistry(zone);
    const zoneName = zone.getAttribute('name');
    if (zoneName && !registry.includes(zoneName)) {
        registry.push(zoneName);
        zone._parentNode.setAttribute('zone-registry', registry.join(','));
    }
}

/**
 * Checks if a component has a zone registered.
 * @param {ArpaElement} component
 * @param {string} zoneName
 * @returns {boolean} Whether the zone is registered.
 */
export function hasRegisteredZone(component, zoneName) {
    return component?.getAttribute('zone-registry')?.split(',').includes(zoneName) || false;
}

/**
 * Adds a zone.
 * @param {ZoneType} zone - The zone to add.
 * @param {ArpaElement} [parentNode] - The container of the zone.
 * @param {Set<ZoneType>} [$store] - An optional store array.
 * @param {Set<ZoneType>} [zones] - The list of zones to add to.
 */
export async function addZone(zone, parentNode, $store = parentNode?._zones || new Set(), zones = ZONES) {
    if (zone?.tagName?.toLowerCase() !== 'zone' || zones.has(zone)) {
        console.error('Invalid or existing zone:', zone);
        return;
    }
    zone._parentNode = parentNode || zone.parentNode;
    const parent = /** @type {HTMLElement | null} */ (zone._parentNode);
    zone._parentTag = parent?.tagName?.toLowerCase();

    const nodeComponent = /** @type {ArpaElement | undefined} */ (
        zone._parentNode || findNodeComponent(/** @type {any} */(zone))
    );
    const store = nodeComponent && '_zones' in nodeComponent ? nodeComponent._zones : $store;
    /** @type {string | null} */
    const zoneName = zone.getAttribute('name');
    if (zoneName) {
        nodeComponent?.zonesByName?.add(zoneName);
        registerZoneInParentNode(zone);
        store?.add(zone);
        zones?.add(zone);
    } else {
        console.warn('Zone has no name:', zone);
    }
}

/**
 * Used to insert a zone into a component while the algorithm is running.
 * @param {ZoneType} zone - The zone to add.
 * @param {ArpaElement} [component] - The container of the zone.
 */
export async function insertZone(zone, component) {
    zone._parentNode = component;
    originalInsertSize++;
    ZONES?.add(zone);
}

/**
 * Removes a zone.
 * @param {ZoneType} zone - The zone to remove.
 * @param {Set<ZoneType>} [zones] - The list of zones to remove from.
 * @returns {void}
 */
export function removeZone(zone, zones = ZONES) {
    zones.delete(zone);
}

/**
 * Extracts the zones from a node and stores them in an reference object.
 * @param {ArpaElement} node - The node to search.
 * @param {{ store?: Set<ZoneType>, parentNode?: ArpaElement, zoneSelector?: string }} [config] - The configuration object.
 */
export function extractZones(node, config = {}) {
    const { store = node._zones || new Set(), parentNode, zoneSelector } = config;
    const zones = selectZones(node, zoneSelector);
    for (const zone of zones) {
        zone.innerHTML.trim() && addZone(zone, parentNode, store, ZONES);
        zone.remove();
    }
}

/**
 * Handles the lost zone.
 * @param {ArpaElement} component - The component that lost the zone.
 * @param {ZoneToolPlaceZoneType} payload
 * @returns {boolean} Whether to register the lost zone.
 */
export function handleOnLostZone(component, payload) {
    let registerLostZone = true;
    if (typeof component?._onLostZone === 'function') {
        const rv = component._onLostZone(payload);
        rv && (registerLostZone = false);
        if (typeof rv === 'function') {
            ZONES_LOADED_CALLBACKS.add([rv, [payload]]);
        }
    }
    return registerLostZone;
}

/**
 * Adds a callback to be called when all zones are loaded.
 * @param {(payload: ZoneToolPlaceZoneType) => void} callback
 * @param {any} [params] - The parameters to pass to the callback.
 * @returns {void}
 */
export function onZonesLoaded(callback, params) {
    ZONES_LOADED_CALLBACKS.add([callback, [params]]);
}

/**
 * Called when there are no more zones to load.
 * @returns {void}
 */
export function _onZonesLoaded() {
    if (ZONES_LOADED_CALLBACKS.size) {
        for (const callbackPair of ZONES_LOADED_CALLBACKS) {
            const fn = callbackPair[0];
            const params = callbackPair[1];
            typeof fn === 'function' && fn(...params);
        }
        ZONES_LOADED_CALLBACKS.clear();
    }
}

/**
 * Gets the resolver selector for a zone.
 * @param {ArpaElement} component - The component to get the selector from.
 * @param {string | null} [zoneName]
 * @returns {string}
 */
export function getResolverSelector(component, zoneName) {
    let selector = '[zone="{zoneName}"]';
    const prop = component?.getProperty('zone-resolver-selector');
    prop && (selector = prop);
    return (zoneName && selector.replace(/{zoneName}/gi, zoneName)) || selector;
}

/**
 * Resolves a zone and returns its component and container.
 * @param {ZoneType} zone - The zone to resolve.
 * @param {ArpaElement} [parent] - The parent node of the zone.
 * @returns {{zoneComponent: ArpaElement | undefined | null, zoneContainer: HTMLElement | null, payload: ZoneToolPlaceZoneType}}
 */
export function resolveZone(zone, parent) {
    const zoneName = zone.getAttribute('name');
    const component = parent && findNodeComponent(parent);
    const resolverSelector = component && getResolverSelector(component, zoneName);

    const zoneContainer = /** @type {HTMLElement | null} */ (
        resolverSelector && component?.querySelector(resolverSelector)
    );
    const nodes = zoneContainer?.childNodes;
    // @ts-ignore
    const zoneComponent = zoneContainer && findNodeComponent(zoneContainer);
    /** @type {ZoneToolPlaceZoneType} */
    const payload = { nodes, zoneName, zoneComponent, zoneContainer, zone };
    if (!zoneContainer || !zoneComponent) {
        component && zoneName && component?.zonesByName?.add(zoneName);
        const registerLostZone = component && handleOnLostZone(component, payload);
        if (zone.innerHTML.trim() !== '' && registerLostZone) {
            LOST_ZONES.add(zone);
        } else {
            removeZone(zone);
            removeZone(zone, LOST_ZONES);
        }
    }
    return { zoneComponent, zoneContainer, payload };
}

/**
 * Places the zone content into its corresponding container.
 * @param {ZoneType} zone
 * @param {HTMLElement | any} [parent] - The parent node of the zone.
 * @returns {Promise<boolean | undefined>} Whether the zone was placed.
 */
export async function placeZone(zone, parent = zone._parentNode) {
    if (!parent) return;

    const { zoneComponent, zoneContainer, payload } = resolveZone(zone, parent);
    if (!zoneContainer || !zoneComponent) return;

    if (typeof zoneComponent?._onPlaceZone === 'function') {
        zoneComponent?._onPlaceZone(payload);
    }
    ZONES.delete(zone);
    LOST_ZONES.delete(zone);
    attr(zoneContainer, getAttributesWithPrefix(zone, 'el-'));
    const append = () => appendNodes(zoneContainer, zone.childNodes);
    if (typeof zoneComponent.onRendered === 'function') {
        zoneComponent.onRendered(append);
    } else {
        append();
    }
    if (ZONES.size <= LOST_ZONES.size) {
        _onZonesLoaded();
    }
}

/**
 * Checks if a node has a zone with a specific name.
 * @param {ArpaElement} component - An HTML node.
 * @param {string} name
 * @returns {boolean} Whether the node has the zone.
 */
export function hasZone(component, name) {
    const parent = /** @type {ArpaElement | null} */ (component.parentElement);
    return (
        hasRegisteredZone(component, name) ||
        component?.zonesByName?.has(name) ||
        parent?.zonesByName?.has(name) ||
        false
    );
}

/**
 * Gets a zone from a component.
 * @param {ArpaElement} component - The component to search.
 * @param {string} name
 * @returns {ZoneType | null} The zone or false if not found.
 */
export function getZone(component, name) {
    if (component._zones) {
        for (const zone of component._zones) {
            if (zone.getAttribute('name') === name) return zone;
        }
    }
    return null;
}

/**
 * Benchmarks zone placement.
 * @param {number} start - The start time.
 * @param {number} end - The end time.
 */
export const benchmark = (start, end) => {
    if (LOST_ZONES.size) {
        const zoneMap = getPrintableZones(LOST_ZONES);
        console.warn(`${LOST_ZONES.size} zones could not be placed:`, zoneMap);
    }

    console.info('\x1b[94m%s\x1b[0m', 'All zones placed in', Math.round(end - start), 'ms', {
        ZONES,
        LOST_ZONES
    });
    // for (const zone of LOST_ZONES) ZONES.delete(zone);
    // LOST_ZONES.clear();
};

/**
 * Benchmarks zone placement.
 */
/**
 * @callback BenchmarkCallback
 * @param {number} start
 * @param {number} end
 */

/**
 * Benchmarks zone placement.
 * @type {BenchmarkCallback}
 */
const benchMarkCallback = (start, end) => benchmark(start, end);

/**
 * Debounces the benchmark function.
 * @type {BenchmarkCallback}
 */
// @ts-ignore
const benchmarkDebounced = debounce(benchMarkCallback, ZONE_BENCHMARK_INTERVAL);

/**
 * Inserts zones into the DOM.
 * @param {Set<ZoneType>} [zones] - The zones to insert.
 * @param {number} [maxBatchSize] - The maximum batch size.
 * @param {boolean} [isRetry] - Whether it is a retry.
 * @param {number} [start] - The start time.
 */
export function insertZones(zones = ZONES, maxBatchSize = 25, isRetry = false, start = performance.now()) {
    originalInsertSize = zones.size;
    let batch = 0;
    for (const zone of zones) {
        placeZone(zone);
        batch++;
        if (batch >= maxBatchSize) break;
    }

    const doRetry = !isRetry || ZONES.size < originalInsertSize;
    setTimeout(() => {
        if (ZONES.size && doRetry) {
            insertZones(zones, maxBatchSize, true, start);
        } else {
            for (const zone of LOST_ZONES) placeZone(zone);
            if (VERBOSE) {
                benchmarkDebounced(start, performance.now());
            }
        }
    });
}

export const insertZonesThrottled = throttle(insertZones, ZONE_INSERTION_INTERVAL);

/**
 * Handles zones for a node.
 */
export function handleZones() {
    insertZonesThrottled();
}

/**
 * Mixin for zone functionality.
 * @param {ArpaElement | undefined} component
 */
export function zoneMixin(component) {
    if (!component) return;
    !(component?._zones instanceof Set) && (component._zones = new Set());
    !component.zonesByName && (component.zonesByName = new Set());
    extractZones(component);
}

/**
 * Destroys the zones of a component.
 * @param {ArpaElement} component
 */
export function destroyComponentZones(component) {
    const zones = component?._zones || new Set();
    if (!component?._zones?.size) return;
    setTimeout(() => {
        if (!component.isConnected) {
            for (const zone of zones) {
                removeZone(zone);
                removeZone(zone, LOST_ZONES);
            }
            component._zones = new Set();
        }
    }, 5);
}
