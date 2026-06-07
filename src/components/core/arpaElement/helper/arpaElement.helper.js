/**
 * @typedef {import('../../arpaNode/arpaNode.types').ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import("../arpaElement").default} ArpaElement
 * @typedef {import("../../arpaNode/arpaNode").default} ArpaNode
 * @typedef {import("../../arpaZone/arpaZone").default} ArpaZone
 */

import { attr, getAttributes, getAttributesWithPrefix } from '@arpadroid/tools';
import { mergeObjects, renderNode, resolveNode, sortKeys } from '@arpadroid/tools';
import { hasZone } from '../../../../tools/zoneTool';
import { destroyComponentZones } from '../../../../tools/zoneTool';
import { getChildContent, renderChild } from '../../arpaNode/arpaNode.helper';

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
 * Checks if a template string contains variables.
 * @param {string} content
 * @param {Record<string, unknown>} variables
 * @returns {boolean}
 */
export function hasTemplateVariables(content, variables) {
    if (!content || !variables) {
        return false;
    }
    for (const key in variables) {
        if (content.includes(`{${key}}`)) {
            return true;
        }
    }
    return false;
}

/**
 * Processes a template variable.
 * @param {string} name
 * @param {unknown} value
 * @param {ArpaElement} [element] - Optional ArpaElement instance.
 * @returns {unknown} The processed value.
 */
export function processTemplateVariable(name, value, element) {
    if (!value && typeof element?.getTemplateChild === 'function') {
        const child = element?.getTemplateChild(name);
        child && (value = renderChild(element, name, child));
    }
    if (value) return value;
    return element?.getProp(name) || '';
}

/**
 * Processes a template string and replaces the placeholders with the provided props.
 * @param {string} template
 * @param {Record<string, unknown>} props
 * @param {ArpaElement} [element]
 * @returns {string}
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
 * Renders the template for the element.
 * @param {ArpaElement} component
 * @param {string | null} [_template]
 * @param {Record<string, unknown>} [vars]
 * @returns {string}
 */
export function renderTemplate(component, _template, vars = component.getTemplateVars()) {
    const templateContent = component.templates?.content?.innerHTML.trim();
    const template = _template || templateContent || component._getTemplate();

    for (const tplVar of Object.keys(vars)) {
        if (typeof vars[tplVar] === 'function') {
            vars[tplVar] = vars[tplVar](component);
        }
        if (typeof vars[tplVar] === 'string') {
            vars[tplVar] = processTemplate(vars[tplVar], vars, component);
        }
    }
    const result = template && processTemplate(template, vars, component);
    return typeof result === 'string' ? result : '';
}

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

///////////////////////////////
// #region Template Nodes
//////////////////////////////

/**
 * Returns the template selector.
 * @param {ArpaElement} element
 * @returns {string | undefined}
 */
export function getTemplatesSelector(element) {
    const templateTypes = element.getArrayProp('template-types');
    if (!templateTypes?.length) return;
    return templateTypes.map(type => `:scope > template[template-type="${type}"]`).join(', ');
}

/**
 * Selects the templates for the element.
 * @param {ArpaElement} element
 * @param {string} [templateSelector]
 * @returns {HTMLTemplateElement[]}
 */
export function selectTemplates(element, templateSelector = getTemplatesSelector(element)) {
    return (templateSelector && Array.from(element.querySelectorAll(templateSelector))) || [];
}

/**
 * Returns HTML container for the template.
 * @param {ArpaElement} element
 * @param {import('../arpaElement.types').ArpaElementTemplateType} template
 * @returns {HTMLElement | Element | DocumentFragment | null}
 */
export function getTemplateContainer(element, template) {
    let container = template.getAttribute('container') || element.getProp('container');
    typeof container === 'function' && (container = container());
    const resolved = resolveNode(container);
    if (!(resolved instanceof HTMLElement)) {
        console.error('Invalid template container', resolved);
        return element;
    }
    return resolved;
}

/**
 * Gets the attributes from the template.
 * @param {HTMLTemplateElement} template
 * @param {string} [prefix]
 * @returns {Record<string, string | boolean | number>} The attributes from the template.
 */
export function getTemplateAttributes(template, prefix = '') {
    if (prefix) {
        return getAttributesWithPrefix(template, prefix);
    }
    const attr = getAttributes(template);
    delete attr['template-type'];
    delete attr['template-mode'];
    delete attr['template-container'];
    return attr;
}

/**
 * Applies the template attributes to the element.
 * @param {ArpaElement} element
 * @param {HTMLTemplateElement} template
 * @param {Record<string, unknown>} [_payload]
 * @param {string} [attributePrefix]
 */
export async function applyTemplateAttributes(element, template, _payload = {}, attributePrefix = '') {
    const payload = { ...(element.templateVars || {}), ..._payload };
    const attributes = getTemplateAttributes(template, attributePrefix);
    for (const key in attributes) {
        if (typeof attributes[key] === 'string') {
            attributes[key] = processTemplate(attributes[key], payload, element);
        }
    }

    attr(element, attributes);
}

/**
 * Sets the template for the element.
 * @template {ArpaElement} T
 * @param {T} element
 * @param {import('../arpaElement.types').ArpaElementTemplateType} template
 * @param {import('../arpaElement.types').ApplyTemplateConfigType} [payload]
 */
export async function applyTemplate(element, template, payload = {}) {
    if (template instanceof HTMLTemplateElement) {
        applyTemplateAttributes(element, template, payload);
        const templateMode = template?.getAttribute('template-mode') || 'content';
        const content = processTemplate(template.innerHTML, payload, element);
        if (templateMode === 'content') {
            element.templates.content = template;
        } else if (templateMode === 'prepend') {
            element.innerHTML = content + element.innerHTML;
        } else if (templateMode === 'append') {
            element.innerHTML = element.innerHTML + content;
        }
    }
}

/**
 * Updates a child element.
 * @param {ArpaElement} element
 * @param {string} name
 * @param {ArpaNodeConfigType} config
 * @returns {HTMLElement | Node | null}
 */
export function updateChildNode(element, name, config) {
    let node = element.templateNodes[name];
    if (node) {
        if (node instanceof HTMLElement) {
            if (typeof config.attr === 'object') {
                attr(node, config.attr);
            }
            if (config.content) {
                const content = getChildContent(element, name, config);
                node.innerHTML = content;
            }
        }
    } else {
        const conf = mergeObjects(element.getChildConfig(name) || {}, config);
        const renderedNode = renderNode(renderChild(element, name, conf));
        if (renderedNode) {
            element.templateNodes[name] = renderedNode;
            node = renderedNode;
        }
    }
    return node;
}

// #endregion Template Children
