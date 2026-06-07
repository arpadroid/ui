/**
 * @typedef {import('../../arpaNode/arpaNode.types').ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import("../arpaElement").default} ArpaElement
 * @typedef {import("../../arpaNode/arpaNode").default} ArpaNode
 * @typedef {import("../../arpaZone/arpaZone").default} ArpaZone
 */

import {} from '@arpadroid/tools';
import { sortKeys } from '@arpadroid/tools';
import { hasZone } from '../../../../tools/zoneTool';
import { destroyComponentZones } from '../../../../tools/zoneTool';

const FORBIDDEN_ATTRIBUTES = ['template', 'content', 'classNames', 'className'];

////////////////////////////////
// #region Global Helpers
////////////////////////////////

/**
 * Returns the parent ArpaElement of the node.
 * @param {HTMLElement} element
 * @returns {ArpaElement | null}
 */
export function getArpaElement(element) {
    let node = element.parentElement;
    while (node) {
        // @ts-ignore
        if (node?.isArpaElement) {
            return /** @type {ArpaElement} */ (node);
        }
        node = node.parentElement;
    }
    return null;
}

/**
 * Destroys the zones of a component.
 * @param {ArpaElement} element - The component to destroy.
 */
export function onDestroy(element) {
    destroyComponentZones(element);
}

// #endregion Global Helpers

/////////////////////////////////////
// #region Properties & Attributes
////////////////////////////////////

/**
 * Sanitizes an element's attributes by removing any properties that should not be rendered as attributes.
 * This is necessary to prevent rendering internal configuration properties as HTML attributes, which could lead to unexpected behavior or security issues.
 * @param {Record<string, unknown>} attr
 * @param {string} key
 * @returns {Record<string, unknown> | void}
 */
export function sanitizeAttributeEffect(attr, key) {
    if (key === 'attributes' && attr[key] && typeof attr[key] === 'object') {
        const _attr = /** @type {Record<string, unknown>} */ (attr[key]);
        Object.keys(_attr).forEach(attrKey => (attr[attrKey] = _attr[attrKey]));
        delete attr[key];
        return;
    }
    if (FORBIDDEN_ATTRIBUTES.includes(key)) {
        delete attr[key];
        return;
    }
    if (Array.isArray(attr[key])) {
        if (attr[key].length === 0) {
            delete attr[key];
            return;
        }
        attr[key] = attr[key].join(', ');
    }
    if (!Array.isArray(attr[key]) && ['object', 'function'].includes(typeof attr[key])) {
        delete attr[key];
    }
}

/**
 * Returns the user configuration for the component excluding default values.
 * @param {ArpaElement} element
 * @param {Record<string, unknown>} _config
 * @returns {Record<string, unknown>}
 */
export function getUserConfig(element, _config = element._config) {
    /** @type {Record<string, unknown>} */
    const config = { ..._config };
    /** @type {Record<string, unknown>} */
    const defaultConfig = element.getDefaultConfig();
    Object.keys(config).forEach(key => {
        if (
            config[key] === defaultConfig[key] ||
            (Array.isArray(defaultConfig[key]) &&
                JSON.stringify(String(config[key]).split(',')) === JSON.stringify(defaultConfig[key]))
        ) {
            delete config[key];
        }
    });
    return config;
}

/**
 * Sanitizes an element's config to be rendered as attributes.
 * @param {ArpaElement} element
 * @param {Record<string, unknown>} attributes
 * @returns {Record<string, unknown>}
 */
export function sanitizeAttributes(element, attributes) {
    const attr = getUserConfig(element, attributes);
    Object.keys(attr).forEach(key => sanitizeAttributeEffect(attr, key));
    return sortKeys(attr);
}

// #endregion Properties

/////////////////////////////////
// #region Template Rendering
///////////////////////////////

/**
 * Checks if an element has content.
 * @param {ArpaElement} element
 * @param {string} property
 * @param {ArpaNodeConfigType} [config]
 * @returns {boolean}
 */
export function hasContent(element, property, config = {}) {
    if (config.content || config?.childNodes?.length) return true;
    if (typeof element?.getProp === 'function') {
        const rv = element?.getProp(property);
        if (typeof rv === 'string' && rv.length) {
            return true;
        }
    }
    return hasZone(element, property);
}

/**
 * Checks if a component can render.
 * @param {ArpaElement} element
 * @param {number} timeout
 * @returns {boolean}
 */
export function canRender(element, timeout = 200) {
    if (element._hasRendered && element?._lastRendered && element._lastRendered - Date.now() < timeout) {
        console.warn('Stopped component from rerendering too fast', element);
        return false;
    }
    element._lastRendered = Date.now();
    return true;
}

// #endregion Template Rendering
