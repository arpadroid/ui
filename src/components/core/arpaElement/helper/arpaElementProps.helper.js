/**
 * @typedef {import('../../arpaNode/arpaNode.types').ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import("../arpaElement").default} ArpaElement
 * @typedef {import("../../arpaNode/arpaNode").default} ArpaNode
 * @typedef {import("../../arpaZone/arpaZone").default} ArpaZone
 */
import { camelToDashed, listen, dashedToCamel } from '@arpadroid/tools';
import { findNodeComponent } from '../../../../tools/zoneTool';

/**
 * Checks if an element has a property as an attribute or defined in the configuration.
 * @param {ArpaElement} element
 * @param {string} name
 * @param {Record<string, unknown>} [config]
 * @returns {unknown | undefined}
 */
export function hasProp(element, name, config = element._config) {
    name = camelToDashed(name);
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
 * @param {ArpaElement | ArpaNode | ArpaZone} element
 * @param {string} name
 * @param {Record<string, unknown>} [config]
 * @returns {string | unknown}
 */
export function getProp(element, name, config = element._config ?? {}) {
    const configName = dashedToCamel(name);
    let rv;
    rv = element.getAttribute(camelToDashed(name)) || config[configName];
    if (rv === 'undefined') {
        rv = undefined;
    }
    return rv;
}

/**
 * Gets the value of a property from the element's configuration or attributes as an array.
 * @param {ArpaElement | ArpaNode} element
 * @param {string} name
 * @param {Record<string, unknown>} [config]
 * @returns {any[] | unknown}
 */
export function getArrayProp(element, name, config = element._config) {
    const value = getProp(element, name, config);
    if (typeof value === 'string') {
        return value.split(',').map(item => item.trim());
    }
    return value;
}

/**
 * Gets a callback property of a component defined as a string starting with ':'.
 * @param {ArpaElement} element
 * @param {string} propertyName
 * @returns {(() => void) | undefined}
 */
export function getCallbackProp(element, propertyName) {
    const val = getProp(element, propertyName);
    if (typeof val === 'string' && val?.[0] === ':') {
        const methodName = val.slice(1);
        const parentComponent = findNodeComponent(/** @type {ArpaElement} */ (element.parentNode));
        // @ts-ignore
        const method = parentComponent?.[methodName];
        return method?.bind(parentComponent);
    }
}

/**
 * Handles a callback property of a component defined as a string starting with ':'.
 * The callback method will be looked-up and called in the parent component.
 * @param {ArpaElement} element
 * @param {string} propertyName
 * @param {string} eventName
 * @returns {((...args: any[]) => void) | undefined}
 */
export function handleCallbackProp(element, propertyName, eventName = '') {
    const method = getCallbackProp(element, propertyName);
    if (typeof method === 'function' && eventName) {
        listen(element, eventName, method);
    }
    return method;
}

/**
 * Processes a condition string for template rendering. It supports negation with '!' and method calls with '()'.
 * @param {ArpaElement} element
 * @param {string} condition
 * @returns {boolean}
 */
export function evaluatePropToken(element, condition) {
    const isNegation = condition.startsWith('!');
    const propName = isNegation ? condition.slice(1) : condition;
    if (propName.endsWith('()')) {
        const methodName = propName.slice(0, -2);
        // @ts-ignore
        const method = /** @type {() => boolean} */ (element[methodName]);
        if (typeof method === 'function') {
            return isNegation ? Boolean(!method.call(element)) : Boolean(method.call(element));
        }
        return false;
    }

    const hasProp = Boolean(element.hasProp(propName));
    return isNegation ? Boolean(!hasProp) : Boolean(hasProp);
}

/**
 * Evaluates a boolean expression string containing multiple condition tokens joined by '||' and '&&' operators.
 * @param {ArpaElement} element
 * @param {string} expression
 * @returns {boolean}
 */
export function evaluateProp(element, expression) {
    return expression
        .split('||')
        .some(andGroup => andGroup.split('&&').every(token => evaluatePropToken(element, token.trim())));
}
