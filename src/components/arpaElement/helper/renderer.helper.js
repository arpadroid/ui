/**
 * @typedef {import("@arpadroid/tools").CallableType} CallableType
 * @typedef {import("../arpaElement.types").ArpaElementChildOptionsType} ArpaElementChildOptionsType
 * @typedef {import("../arpaElement").default} ArpaElement
 */

import { attr, attrString, dashedToCamel, getAttributesWithPrefix } from '@arpadroid/tools';
import { mergeObjects, renderNode, resolveNode } from '@arpadroid/tools';
import { processTemplate } from './arpaElement.helper';
import { hasZone } from '../../../tools/zoneTool';
const html = String.raw;

/**
 * Checks if an element has content.
 * @param {ArpaElement} element
 * @param {string} property
 * @param {ArpaElementChildOptionsType} [config] - The configuration object.
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

///////////////////////////////
// #region Template Content
///////////////////////////////

/**
 * Returns the template selector.
 * @param {ArpaElement} element
 * @returns {string | undefined}
 */
export function getTemplatesSelector(element) {
    const templateTypes = element.getArrayProperty('template-types');
    if (!templateTypes?.length) return;
    return templateTypes.map(type => `:scope > template[type="${type}"]`).join(', ');
}

/**
 * Selects the templates for the element.
 * @param {ArpaElement} element
 * @param {string} [templateSelector] - The selector for the templates.
 * @returns {HTMLTemplateElement[]} The selected templates.
 */
export function selectTemplates(element, templateSelector = getTemplatesSelector(element)) {
    return (templateSelector && Array.from(element.querySelectorAll(templateSelector))) || [];
}

/**
 * Gets the content of the template for the element.
 * @param {ArpaElement} element
 * @param {HTMLTemplateElement} template
 * @param {Record<string, unknown>} [payload]
 * @returns {string}
 */
export function getTemplateContent(element, template = element._config.template, payload) {
    if (!payload) {
        payload = element.getTemplateVars();
        element.templateVars = payload;
    }
    return processTemplate(template.innerHTML, payload, element);
}

/**
 * Returns HTML container for the template.
 * @param {ArpaElement} element
 * @param {import('../arpaElement.types').ArpaElementTemplateType} template
 * @returns {HTMLElement | Element | DocumentFragment | null}
 */
export function getTemplateContainer(element, template) {
    let container = template.getAttribute('container') || element.getProperty('template-container');
    typeof container === 'function' && (container = container());
    const resolved = resolveNode(container);
    if (!(resolved instanceof HTMLElement)) {
        console.error('Invalid template container', resolved);
        return element;
    }
    return resolved;
}

/**
 * Renders the template for the element.
 * @param {ArpaElement} component - The component to render.
 * @param {string | null} [_template] - The template to render.
 * @param {Record<string, unknown>} [vars] - The variables to use in the template.
 * @returns {string} The rendered template.
 */
export function renderTemplate(component, _template, vars = component.getTemplateVars()) {
    const templateContent = component.templates?.content?.innerHTML.trim();
    const template = _template || templateContent || component._getTemplate();
    for (const tplVar of Object.keys(vars)) {
        if (typeof vars[tplVar] === 'string') {
            vars[tplVar] = processTemplate(vars[tplVar], vars, component);
        }
    }
    const result = template && processTemplate(template, vars, component);
    return typeof result === 'string' ? result : '';
}

/**
 * Sets the template for the element.
 * @param {ArpaElement} element
 * @param {import('../arpaElement.types').ArpaElementTemplateType} template
 * @param {import('../arpaElement.types').ApplyTemplateConfigType} [config]
 */
export async function applyTemplate(element, template, config = {}) {
    const { contentMode = template.getAttribute('type') } = config;
    const container = getTemplateContainer(element, template);
    if (!(container instanceof HTMLElement)) {
        console.error('Invalid template container', container);
        return;
    }
    const attributes = getAttributesWithPrefix(template, 'element-');
    attr(container, attributes);
    const content = getTemplateContent(element, template);
    const node = document.createElement('div');
    node.innerHTML = content;
    if (contentMode === 'content') {
        container.innerHTML = '';
        container.append(...node.childNodes);
    } else if (contentMode === 'prepend') {
        container.prepend(...node.childNodes);
    } else {
        container.append(...node.childNodes);
    }
}

// #endregion Template Content

///////////////////////////////
// #region Template Children
//////////////////////////////

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
 * @param {ArpaElementChildOptionsType} [config] - The configuration object.
 * @returns {boolean}
 */
export function canRenderChild(element, name, config = {}) {
    const { canRender } = config;
    if (canRender === true || canRender === false) return canRender;
    if (typeof canRender === 'function') return canRender(element);

    if (typeof canRender === 'string' && typeof element?.hasProperty === 'function') {
        return Boolean(element.hasProperty(canRender));
    }
    return hasContent(element, name, config);
}

/**
 * Gets the default configuration for a child element.
 * @param {ArpaElement} element - The component to check.
 * @param {string} name
 * @returns {ArpaElementChildOptionsType}
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
 * @param {ArpaElementChildOptionsType} [config] - The configuration object.
 * @param {Record<string, string>} [attributes] - Additional attributes to add to the element.
 * @returns {Record<string, string>}
 */
export function getChildAttributes(element, name, config = {}, attributes = {}) {
    const { className, hasZone, zoneName } = config;
    const attr = mergeObjects(config.attr || {}, attributes);
    config.id && (attr.id = config.id);
    className && (attr.class = className);
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
 * @param {ArpaElementChildOptionsType} [config] - The configuration object.
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
 * @param {ArpaElementChildOptionsType} [config] - The configuration object.
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

/**
 * Updates a child element.
 * @param {ArpaElement} element
 * @param {string} name
 * @param {ArpaElementChildOptionsType} config - The configuration object.
 * @returns {HTMLElement | null}
 */
export function updateChildNode(element, name, config) {
    let node = element.templateNodes[name];
    if (node) {
        if (typeof config.attr === 'object') {
            attr(node, config.attr);
        }
        if (config.content) {
            const content = getChildContent(element, name, config);
            node.innerHTML = content;
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

/**
 * Initializes the template nodes for the element.
 * @param {ArpaElement} element - The component to check.
 */
export function initializeTemplateNodes(element) {
    const conf = element.getChildrenConfig();
    if (!conf) return;
    for (const name of Object.keys(conf)) {
        const className = getChildClassName(element, name);
        /** @type {HTMLElement | null} */
        const node = element.querySelector(`.${className}`);
        node && (element.templateNodes[name] = node);
    }
}

// #endregion Template Children
