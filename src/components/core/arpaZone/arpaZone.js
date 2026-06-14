/**
 * @typedef {import('./arpaZone.types').ArpaZoneConfigType} ArpaZoneConfigType
 * @typedef {import('../arpaElement/arpaElement.js').default} ArpaElement
 */
import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
import { getArpaElement } from '../arpaElement/helper/arpaElement.helper';
import { getProp } from '../arpaElement/helper/arpaElementProps.helper.js';
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
            if (container instanceof HTMLElement && 'promise' in container) {
                await container.promise;
            }
            // @ts-ignore
            const zoneElement = this.getZoneElement(container);
            if (zoneElement) {
                return zoneElement;
            }
        }
    }

    /**
     * Returns the zone container element for this zone.
     * @param {ArpaElement | null} [container]
     * @returns {HTMLElement | null | undefined}
     */
    getZoneElement(container = this.element) {
        const zoneName = this.getProp('name');
        return container?.querySelector(`[zone="${zoneName}"]`);
    }

    async connectedCallback() {
        this._initializeZone();
        const name = this.getProp('name');
        if (!name) {
            console.error('An arpa-zone must have a name attribute or configuration property defined.');
            return;
        }
        if (!this.element) {
            console.error('An arpa-zone must have a parent arpa-element');
            return;
        }
        await this.element.promise;
        let zoneElement = /** @type { ArpaElement | null } */ (
            this.getZoneElement() || (await this.findZoneElement())
        );

        const zoneTarget = zoneElement?.getAttribute('zone-target');
        if (zoneElement && zoneTarget) {
            zoneElement?.promise && (await zoneElement?.promise);
            const zoneTargetNode = zoneElement?.querySelector(zoneTarget);
            // @ts-ignore
            zoneTargetNode && (zoneElement = zoneTargetNode);
        }
        zoneElement?.append(this.fragment);
        if (!zoneElement) {
            console.error(`No zone element found for zone "${name}". `, zoneElement, zoneTarget);
        }
    }
}

defineCustomElement('arpa-zone', ArpaZone);

export default ArpaZone;
