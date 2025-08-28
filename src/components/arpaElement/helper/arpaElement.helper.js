/**
 * @typedef {import("../arpaElement").default} ArpaElement
 */

import { dashedToCamel } from '@arpadroid/tools';
import { renderChild } from './renderer.helper';
import { destroyComponentZones } from '../../../tools/zoneTool';

/**
 * Checks if an element has a property as an attribute or defined in the configuration.
 * @param {ArpaElement} element - The element to check.
 * @param {string} name
 * @param {Record<string, unknown>} [config] - The configuration object.
 * @returns {unknown | undefined} Whether the element has the property.
 */
export function hasProperty(element, name, config = element._config) {
    const attrVal = element.getAttribute(name);
    if (attrVal === 'false') {
        return false;
    }
    if (element.hasAttribute(name)) {
        return true;
    }
    if (typeof config[dashedToCamel(name)] !== 'undefined') {
        return config[dashedToCamel(name)];
    }
}

/**
 * Gets the value of a property from the element's configuration or attributes.
 * @param {ArpaElement} element - The element to get the property from.
 * @param {string} name
 * @param {Record<string, unknown>} [config] - The configuration object.
 * @returns {string | unknown} The value of the property.
 */
export function getProperty(element, name, config = element._config ?? {}) {
    const configName = dashedToCamel(name);
    /** @todo Try to remove the try / catch. */
    let rv;
    try {
        rv = element.getAttribute(name) ?? config[configName];
        // eslint-disable-next-line sonarjs/no-ignored-exceptions
    } catch (_error) {
        rv = config[configName];
    }
    if (rv === 'undefined') {
        rv = undefined;
    }
    return rv;
}

/**
 * Gets the value of a property from the element's configuration or attributes as an array.
 * @param {ArpaElement} element - The element to get the property from.
 * @param {string} name
 * @param {Record<string, unknown>} [config] - The configuration object.
 * @returns {any[] | unknown} The value of the property as an array.
 */
export function getArrayProperty(element, name, config = element._config) {
    const value = getProperty(element, name, config);
    if (typeof value === 'string') {
        return value.split(',').map(item => item.trim());
    }
    return value;
}

/**
 * Processes a template variable.
 * @param {string} name
 * @param {unknown} value
 * @param {ArpaElement} element
 * @returns {unknown} The processed value.
 */
export function processTemplateVariable(name, value, element) {
    if (!value && typeof element?.getTemplateChildren === 'function') {
        const child = element?.getTemplateChild(name);
        if (child) {
            value = renderChild(element, name, child);
        }
    }
    return value || '';
}

/**
 * Processes a template string and replaces the placeholders with the provided props.
 * @param {string} template - The template string.
 * @param {Record<string, unknown>} props - The props to replace the placeholders with.
 * @param {ArpaElement} element
 * @returns {string} The processed template.
 */
export function processTemplate(template, props = {}, element) {
    if (!template) {
        return '';
    }
    const result = [];
    let startIndex = 0;
    let matchIndex = 0;
    while ((matchIndex = template.indexOf('{', startIndex)) !== -1) {
        result.push(template.slice(startIndex, matchIndex));
        const endIndex = template.indexOf('}', matchIndex);
        if (endIndex === -1) {
            break;
        }
        const placeholder = template.slice(matchIndex + 1, endIndex);
        const val = processTemplateVariable(placeholder, props[placeholder], element);
        result.push(val);
        startIndex = endIndex + 1;
    }
    result.push(template.slice(startIndex));
    return result.join('');
}

/**
 * Destroys the zones of a component.
 * @param {ArpaElement} element - The component to destroy.
 */
export function onDestroy(element) {
    destroyComponentZones(element);
}
