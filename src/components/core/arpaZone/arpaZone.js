/**
 * @typedef {import('./arpaZone.types').ArpaZoneConfigType} ArpaZoneConfigType
 * @typedef {import('../arpaElement/arpaElement.js').default} ArpaElement
 */
import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
import { getArpaElement, getProperty } from '../arpaElement/helper/arpaElement.helper';

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
        this.element?.zonesByName?.add(this.getProperty('name'));
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
    getProperty(name) {
        return getProperty(this, name);
    }

    async connectedCallback() {
        this._initializeZone();

        const name = this.getProperty('name');
        if (!name) {
            console.error('An arpa-zone must have a name attribute or configuration property defined.');
            return;
        }
        if (!this.element) {
            console.error('An arpa-zone must have a parent arpa-element');
            return;
        }
        await this.element.promise;
        const zoneName = this.getProperty('name');
        const zoneElement = this.element.querySelector(`[zone="${zoneName}"]`);
        zoneElement?.append(this.fragment);
    }
}

defineCustomElement('arpa-zone', ArpaZone);

export default ArpaZone;
