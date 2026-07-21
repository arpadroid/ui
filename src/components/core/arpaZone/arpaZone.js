/**
 * @typedef {import('./arpaZone.types').ArpaZoneConfigType} ArpaZoneConfigType
 */
import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
import { getArpaElement } from '../arpaElement/helper/arpaElement.helper';
import { getProp } from '../arpaElement/helper/arpaElementProps.helper.js';
import ArpaElement from '../arpaElement/arpaElement.js';

export const LOST_ZONES = new Set();

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
            if ('promise' in container) {
                await container.promise;
            }
            // @ts-ignore
            const zoneElement = this.selectZoneElement(container);
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
        /** @type {Element | undefined | null} */
        let zoneElement = this.selectZoneElement() || (await this.findZoneElement());

        if (zoneElement) {
            if (zoneElement instanceof ArpaElement) {
                await zoneElement.promise;
            }
            const target = this.getZoneTarget(zoneElement);
            target && (zoneElement = target);
        }

        if (!zoneElement) {
            await this.element?.promise;
            await new Promise(resolve => setTimeout(resolve, 1));
            zoneElement =
                this.selectZoneElement() ||
                (await this.findZoneElement()) ||
                document.querySelector(`body > *[zone="${name}"]`);
        }

        if (!zoneElement) {
            LOST_ZONES.add(name);
            console.error(`No zone element found for zone "${name}".`);
        }

        if (this.hasAttribute('replace-content')) {
            zoneElement?.replaceChildren(...this.fragment?.childNodes);
        } else {
            zoneElement?.append(this.fragment);
        }

        this.remove();
    }
}

defineCustomElement('arpa-zone', ArpaZone);

export default ArpaZone;
