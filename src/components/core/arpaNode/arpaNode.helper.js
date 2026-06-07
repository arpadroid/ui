/**
 * @typedef {import("./arpaNode.types").ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import("../arpaElement/arpaElement").default} ArpaElement
 */

import { attrString, dashedToCamel, mergeObjects } from '@arpadroid/tools';
import { hasContent, processTemplate } from '../arpaElement/helper/arpaElement.helper';

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
 * Gets the default configuration for a child element.
 * @param {ArpaElement} element - The component to check.
 * @param {string} name
 * @returns {ArpaNodeConfigType}
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
 * Renders a child element.
 * @param {ArpaElement} element - The component to check.
 * @param {string} name
 * @param {ArpaNodeConfigType} [config] - The configuration object.
 * @param {Record<string, boolean | string>} [attributes] - Additional attributes to add to the element.
 * @returns {boolean | string}
 */
export function canRenderChild(element, name, config = {}, attributes = {}) {
    const { canRender = true } = config;
    const { canRender: attrCanRender = true } = attributes;
    if (attributes.canRender === true) {
        return true;
    }
    if (Boolean(attrCanRender) === false || Boolean(canRender) === false) {
        return false;
    }
    if (typeof canRender === 'function') {
        return canRender(element);
    }

    let canRenderStr = (typeof attrCanRender === 'string' && attrCanRender) || '';
    !canRenderStr && typeof canRender === 'string' && (canRenderStr = canRender);
    if (canRenderStr && typeof element?.hasProperty === 'function') {
        const isNegation = canRenderStr.startsWith('!');
        const propName = isNegation ? canRenderStr.slice(1) : canRenderStr;
        if (propName.endsWith('()')) {
            const methodName = propName.slice(0, -2);
            // @ts-ignore
            const method = /** @type {() => boolean} */ (element[methodName]);
            if (typeof method === 'function') {
                return isNegation ? Boolean(!method.call(element)) : Boolean(method.call(element));
            }
            return false;
        }

        const hasProp = Boolean(element.hasProperty(propName));
        return isNegation ? Boolean(!hasProp) : Boolean(hasProp);
    }

    if (config.isContent || attributes.isContent || config?.childNodes?.length) {
        return true;
    }

    return hasContent(element, name, config);
}

/**
 * Gets the attributes for a child element.
 * @param {ArpaElement} element
 * @param {string} name
 * @param {ArpaNodeConfigType} [config] - The configuration object.
 * @param {Record<string, unknown>} [attributes] - Additional attributes to add to the element.
 * @returns {Record<string, string>}
 */
export function getChildAttributes(element, name, config = {}, attributes = {}) {
    const { className, id, hasZone, zoneName, isContent = false } = config;
    !attributes.isContent && (attributes.isContent = isContent);
    const attr = mergeObjects(config.attr || {}, attributes);

    id && (attr.id = id);
    className && (attr.class = `${attr.class || ''} ${className}`.trim());

    attr.canRender && delete attr.canRender;
    hasZone && (attr.zone = zoneName);
    for (const key in attr) {
        if (!attr[key]) continue;
        if (typeof attr[key] === 'function') {
            attr[key] = attr[key](element);
        }
        if (typeof attr[key] === 'string') {
            attr[key] = processTemplate(attr[key], element?.templateVars, element);
        }
    }
    return attr;
}

/**
 * Gets the content for a child element.
 * @param {ArpaElement} element - The component to check.
 * @param {string} name
 * @param {ArpaNodeConfigType} [config] - The configuration object.
 * @returns {string}
 */
export function getChildContent(element, name, config = {}) {
    let content = config.content || (name && element?.getProperty(name)) || '';
    typeof content === 'function' && (content = content());
    return processTemplate(
        /** @type {string} **/ (content),
        element?.getPayload(element?.templateVars),
        element
    );
}

/**
 * Renders a child element.
 * @param {ArpaElement} element
 * @param {string} name
 * @param {ArpaNodeConfigType} [config]
 * @param {Record<string, string | boolean>} [attributes]
 * @returns {string}
 */
export function renderChild(element, name, config = {}, attributes = {}) {
    const defaults = getDefaultChildConfig(element, name);
    config = mergeObjects(defaults, config);
    const canRender = canRenderChild(element, name, config, attributes);
    if (canRender) {
        typeof config.attr === 'function' && (config.attr = config.attr());
        const attr = getChildAttributes(element, name, config, attributes);
        const { tag } = config;
        const isFragment = tag === 'fragment';
        let content = isFragment ? '' : `<${tag} ${attrString(attr)}>`;
        content += getChildContent(element, name, config);
        content += isFragment ? '' : `</${tag}>`;
        return content;
    }
    return '';
}
