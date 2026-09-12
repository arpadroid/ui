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
        this.promise = new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        }).catch(err => {
            const message = err.message || 'Failed Rendering Zone:';
            const payload = err;
            delete payload.message;
            console.error(message, payload);
        });
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
            if (zoneElement) return zoneElement;
        }
        return await this.waitForZoneElement();
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
     * @returns {import('../arpaNode/arpaNode').ArpaElementContentNodeType | null | undefined}
     */
    selectZoneElement(container = this.element) {
        const zoneName = this.getProp('name');
        for (const node of Object.values(this.element?.nodes || {})) {
            if (zoneName === node.getAttribute('zone')) {
                return node;
            }
        }
        /**
         * The below is risky because it relies on a querySelector which may not always return the correct element.
         */
        return container?.querySelector(`[zone="${zoneName}"]`);
    }

    /**
     * Returns the target element for the zone, which is either specified by the 'zone-target' attribute or defaults to the zone element itself.
     * @param {import('../arpaNode/arpaNode').ArpaElementContentNodeType} zoneElement
     * @returns {Promise<Element | null | undefined>}
     */
    async getZoneTarget(zoneElement) {
        let zoneTarget =
            zoneElement.getAttribute('zone-target') ||
            ('zoneTarget' in zoneElement && zoneElement?.zoneTarget) ||
            null;
        if ('getZoneTarget' in zoneElement && typeof zoneElement.getZoneTarget === 'function') {
            zoneTarget = await zoneElement.getZoneTarget();
        }

        if (typeof zoneTarget === 'string') {
            zoneTarget = zoneElement?.querySelector(zoneTarget);
        }
        return zoneTarget || zoneElement;
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

        if (typeof this.element?.onRendered === 'function') {
            this.element?.onRenderReady(() => this.onRenderReady());
        } else {
            this.onRenderReady();
        }
    }

    async onRenderReady() {
        /** @type {Element | undefined | null} */
        let zoneElement = this.selectZoneElement() || (await this.findZoneElement());
        if (zoneElement) {
            'promise' in zoneElement && (await zoneElement.promise);
            const target = await this.getZoneTarget(zoneElement);
            if (target) {
                zoneElement = target;
            }
        }
        if (!zoneElement) {
            const name = this.getAttribute('name');
            LOST_ZONES.add(name);
            this.remove();
            this.rejectPromise?.({
                message: `No element found for zone "${name}".`
            });
            return;
        }
        this.zoneElement = zoneElement;
        this.apply(this.zoneElement);
    }

    /**
     * @param {Element | undefined | null} zoneElement
     * @returns {void | boolean}
     */
    apply(zoneElement = this.zoneElement) {
        if (!zoneElement) return;
        let method = /** @type {import('@arpadroid/tools').MethodWriteType} */ ('append');
        if (this.hasAttribute('replace-content')) {
            method = 'replaceChildren';
        } else if (this.hasAttribute('prepend-content')) {
            method = 'prepend';
        }
        if (this.element?.$onZonePlaced?.(this, zoneElement) === false) {
            return false;
        }
        if ('$onZoneInserted' in zoneElement && typeof zoneElement?.$onZoneInserted === 'function') {
            if (zoneElement?.$onZoneInserted?.(this, zoneElement) === false) {
                return false;
            }
        }

        //@ts-ignore
        zoneElement[method](this.fragment);

        this.remove();
        // return zoneElement;
        // this.element?.batcher?.write(zoneElement, {
        //     method,
        //     value: this.fragment,
        //     callback: () => {
        //         if (this.element?.$onZonePlaced?.(this, zoneElement) === false) {
        //             return false;
        //         }
        //         if ('$onZoneInserted' in zoneElement && typeof zoneElement?.$onZoneInserted === 'function') {
        //             if (zoneElement?.$onZoneInserted?.(this, zoneElement) === false) {
        //                 return false;
        //             }
        //         }
        //     }
        // });
        // this.element?.batcher?.remove(this);
        this.resolvePromise?.(true);
    }
}

defineCustomElement('arpa-zone', ArpaZone);

export default ArpaZone;
