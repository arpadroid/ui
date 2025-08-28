/**
 * @typedef {import("@arpadroid/tools").CallableType} CallableType
 * @typedef {import("@arpadroid/tools").CustomElementChildOptionsType} CustomElementChildOptionsType
 * @typedef {import("../arpaElement").default} ArpaElement
 */

import { attrString, dashedToCamel, hasZone, mergeObjects } from '@arpadroid/tools';
import { processTemplate } from './arpaElement.helper';
const html = String.raw;

/**
 * Checks if an element has content.
 * @param {ArpaElement} element
 * @param {string} property
 * @param {CustomElementChildOptionsType} [config] - The configuration object.
 * @returns {boolean}
 */
export function hasContent(element, property, config = {}) {
    if (config.content) return true;
    if (typeof element?.getProperty === 'function') {
        const rv = element?.getProperty(property);
        if (typeof rv === 'string' && rv.length) {
            return true;
        }
    }
    return hasZone(element, property);
}

/**
 * Checks if a component can render.
 * @param {ArpaElement} element - The component to check.
 * @param {number} timeout
 * @returns {boolean} Whether the component can render.
 */
export function canRender(element, timeout = 200) {
    if (element._hasRendered && element?._lastRendered && element._lastRendered - Date.now() < timeout) {
        console.warn('Stopped component from rerendering too fast', element);
        return false;
    }
    element._lastRendered = Date.now();
    return true;
}

/**
 * Computes the class name for a child element.
 * @param {ArpaElement} element - The component to check.
 * @param {string} name
 * @returns {string}
 */
export function getChildClassName(element, name) {
    let className = '';
    const baseClass = element?.getClassName() || '';
    baseClass && (className += `${baseClass}__`);
    className += dashedToCamel(name);
    return className;
}
/**
 * Renders a child element.
 * @param {ArpaElement} element - The component to check.
 * @param {string} name
 * @param {CustomElementChildOptionsType} [config] - The configuration object.
 * @returns {boolean}
 */
export function canRenderChild(element, name, config = {}) {
    const { canRender } = config;
    if (canRender === true) return true;
    if (typeof canRender === 'function') {
        return canRender(element);
    }
    return hasContent(element, name, config);
}

/**
 * Gets the default configuration for a child element.
 * @param {ArpaElement} element - The component to check.
 * @param {string} name
 * @returns {CustomElementChildOptionsType}
 */
export function getDefaultChildConfig(element, name) {
    return mergeObjects(
        {
            tag: 'div',
            hasZone: true,
            zoneName: name,
            propName: name,
            className: getChildClassName(element, name)
        },
        element?.getChildConfig(name) || {}
    );
}

/**
 * Gets the attributes for a child element.
 * @param {ArpaElement} element
 * @param {string} name
 * @param {CustomElementChildOptionsType} [config] - The configuration object.
 * @param {Record<string, string>} [attributes] - Additional attributes to add to the element.
 * @returns {Record<string, string>}
 */
export function getChildAttributes(element, name, config = {}, attributes = {}) {
    const { className, hasZone, zoneName } = config;
    const attr = mergeObjects(config.attr || {}, attributes);
    for (const key in attr) {
        if (typeof attr[key] === 'function') {
            attr[key] = attr[key](element);
        }
    }
    config.id && (attr.id = config.id);
    className && (attr.class = className);
    hasZone && (attr.zone = zoneName);
    return attr;
}

/**
 * Gets the content for a child element.
 * @param {ArpaElement} element - The component to check.
 * @param {string} name
 * @param {CustomElementChildOptionsType} [config] - The configuration object.
 * @returns {string}
 */
export function getChildContent(element, name, config = {}) {
    let content = config.content || (name && element?.getProperty(name)) || '';
    typeof content === 'function' && (content = content());
    return processTemplate(/** @type {string} **/ (content), element?.templateVars, element);
}

/**
 * Renders a child element.
 * @param {ArpaElement} element - The component to check.
 * @param {string} name
 * @param {CustomElementChildOptionsType} [config] - The configuration object.
 * @param {Record<string, string>} [attributes] - Additional attributes to add to the element.
 * @returns {string}
 */
export function renderChild(element, name, config = {}, attributes = {}) {
    config = mergeObjects(getDefaultChildConfig(element, name), config);
    if (!canRenderChild(element, name, config)) return '';
    const attr = getChildAttributes(element, name, config, attributes);
    const { tag } = config;
    return html`<${tag} ${attrString(attr)}>${getChildContent(element, name, config)}</${tag}>`;
}
