/**
 * @typedef {import('./arpaZone.types').ArpaZoneConfigType} ArpaZoneConfigType
 */
import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
import { getArpaElement } from '../arpaElement/helper/arpaElement.helper';
import { getProp } from '../arpaElement/helper/arpaElementProps.helper.js';
import ArpaElement from '../arpaElement/arpaElement.js';

export const LOST_ZONES = new Set();
/**@type {ArpaZone[]} */
export const QUEUE = [];

class ArpaZone extends HTMLElement {
    /**
     * Creates an instance of ArpaZone.
     * @param {ArpaZoneConfigType} config
     */
    constructor(config) {
        super();
        this.fragment = document.createDocumentFragment();
        this._initializeContent();
        this.setConfig(config);
        this._initializeZone();
    }

    _initializeContent() {
        this.fragment.append(...this.childNodes);
        this._childNodes = [...this.fragment.childNodes];
    }

    _initializeZone() {
        /** @type {ArpaElement | null} */
        this.element = this.element || getArpaElement(this);
        this.element?.zonesByName?.add(this.getProp('name'));
        this.element?._zones?.add(this);
    }

    /**
     * Sets the configuration for the ArpaZone component.
     * @param {ArpaZoneConfigType} config
     */
    setConfig(config) {
        /** @type {ArpaZoneConfigType} */
        this._config = mergeObjects(this.getDefaultConfig(), config);
    }

    /**
     * Returns the default configuration for the ArpaZone component.
     * @returns {ArpaZoneConfigType}
     */
    getDefaultConfig() {
        /** @type {ArpaZoneConfigType} */
        const config = {
            name: undefined
        };

        return config;
    }

    /**
     * Returns the value of a property from the element's configuration or attributes.
     * @param {string} name
     * @returns {any}
     */
    getProp(name) {
        return getProp(this, name);
    }

    async findZoneElement(element = this.element) {
        const containers = /** @type {(HTMLElement)[]} */ [...Object.values(element?.nodes || {})];
        for (const container of containers) {
            if (!container || !(container instanceof HTMLElement)) continue;
            if ('promise' in container) {
                await container.promise;
            }
            // @ts-ignore
            const zoneElement = this.selectZoneElement(container);
            if (zoneElement) {
                return zoneElement;
            }
        }
        return this.waitForZoneElement();
    }

    /**
     * Polls for the zone element on successive animation frames instead of a blind fixed delay.
     * @param {number} [maxRetries]
     * @returns {Promise<Element | null | undefined>}
     */
    async waitForZoneElement(maxRetries = 10) {
        for (let i = 0; i < maxRetries; i++) {
            const zoneElement = this.selectZoneElement();
            if (zoneElement) {
                return zoneElement;
            }
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
        return this.selectZoneElement();
    }

    /**
     * Returns the zone container element for this zone.
     * @param {ArpaElement | null} [container]
     * @returns {HTMLElement | null | undefined}
     */
    selectZoneElement(container = this.element) {
        const zoneName = this.getProp('name');
        return container?.querySelector(`[zone="${zoneName}"]`);
    }

    /**
     * Returns the target element for the zone, which is either specified by the 'zone-target' attribute or defaults to the zone element itself.
     * @param {import('../arpaNode/arpaNode').ArpaElementContentNodeType} zoneElement
     * @returns {Element | null}
     */
    getZoneTarget(zoneElement) {
        const zoneTarget = zoneElement.getAttribute('zone-target');
        const zoneTargetNode = zoneTarget && zoneElement?.querySelector(zoneTarget);
        return zoneTargetNode || ('zoneTarget' in zoneElement && zoneElement?.zoneTarget) || zoneElement;
    }

    /**
     * Adds the contents of the zone to the specified container element, either replacing, prepending, or appending based on the attributes of the ArpaZone.
     * @param {Element | undefined} zoneElement
     */
    async addZoneContentsToContainer(zoneElement = this.zoneElement) {
        if (!this.fragment.childNodes.length) {
            return;
        }
        if (typeof this.element?.$onZonePlaced === 'function') {
            const rv = this.element?.$onZonePlaced?.(this, zoneElement);
            if (rv === false) {
                return;
            }
        }
        if (this.hasAttribute('replace-content')) {
            zoneElement?.replaceChildren(...this.fragment?.childNodes);
        } else if (this.hasAttribute('prepend-content')) {
            zoneElement?.prepend(...this.fragment?.childNodes);
        } else {
            zoneElement?.append(this.fragment);
        }
    }
    /**
     * Inserts zones in their containers in batches.
     * @param {{batchSize?: number}} config
     */
    async insertZones(config = {}) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (QUEUE.length === 0) return;
        const { batchSize = 20 } = config;
        const batch = QUEUE.splice(-batchSize);
        batch.forEach(zone => {
            zone.addZoneContentsToContainer();
            zone.remove();
        });
        requestAnimationFrame(() => {
            if (QUEUE.length > 0) {
                this.insertZones(config);
            }
        });
    }

    apply() {
        QUEUE.unshift(this);
        if (QUEUE.length === 1) {
            this.insertZones();
        }
    }

    async connectedCallback() {
        this._initializeZone();
        const name = this.getProp('name');
        if (!name) {
            console.error('An arpa-zone must have a name attribute or configuration property defined.');
            return;
        }
        if (!this.element) {
            await new Promise(resolve => requestAnimationFrame(resolve));
            this._initializeZone();
            if (!this.element) {
                console.error('An arpa-zone must have a parent arpa-element', {
                    zone: this,
                    name,
                    element: this.element
                });
            }
            return;
        }
        await this.element.promise;
        /** @type {Element | undefined | null} */
        let zoneElement = this.selectZoneElement() || (await this.findZoneElement());
        if (zoneElement) {
            'promise' in zoneElement && (await zoneElement.promise);
            const target = this.getZoneTarget(zoneElement);
            if (target) {
                zoneElement = target;
            }
        }
        if (!zoneElement) {
            await new Promise(resolve => setTimeout(resolve, 10));
            if (!this.zoneElement) {
                LOST_ZONES.add(name);
                console.error(`No zone element found for zone "${name}".`);
                this.remove();
            }
            return;
        }
        this.zoneElement = zoneElement;
        this.apply();
    }
}

defineCustomElement('arpa-zone', ArpaZone);

export default ArpaZone;
