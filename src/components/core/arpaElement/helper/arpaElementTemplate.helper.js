/**
 * @typedef {import("../arpaElement").default} ArpaElement
 * @typedef {import('../../arpaNode/arpaNode.types').ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import("../../arpaNode/arpaNode").default} ArpaNode
 * @typedef {import("../../arpaZone/arpaZone").default} ArpaZone
 */

import { attr, getAttributes, getAttributesWithPrefix } from '@arpadroid/tools';
import { mergeObjects, renderNode, attrString, dashedToCamel } from '@arpadroid/tools';
import { hasContent } from '../helper/arpaElement.helper';
import { evaluateProp } from './arpaElementProps.helper';

//////////////////////////////////
// #region Template Processing
//////////////////////////////////

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
    if (!value && typeof element?.getNodeConfig === 'function') {
        const child = element?.getNodeConfig(name);
        // eslint-disable-next-line no-use-before-define
        child && (value = renderChild(element, name, child));
    }
    if (!value) {
        const methodName = dashedToCamel(name);
        // @ts-ignore
        let method = element?.[methodName];
        if (methodName.startsWith('$') && typeof method === 'function') {
            method = method?.bind(element);
            value = method();
        }
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
    const template = _template || templateContent || component.$renderTemplate();

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

// #endregion Template Processing

/////////////////////////////////////////////////
// #region Template Children
////////////////////////////////////////////////

/**
 * Computes the class name for a child element.
 * @param {ArpaElement} element - The component to check.
 * @param {string} name
 * @returns {string}
 */
export function getClass(element, name) {
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
            className: getClass(element, name)
        },
        element?.getNodeConfig(name) || {}
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
export function canRenderNode(element, name, config = {}, attributes = {}) {
    const { canRender = true } = config;
    const { canRender: attrCanRender = true } = attributes;
    if (Boolean(attrCanRender) === false || Boolean(canRender) === false) {
        return false;
    }
    if (typeof canRender === 'function') {
        return canRender(element);
    }

    let canRenderStr = (typeof attrCanRender === 'string' && attrCanRender) || '';
    !canRenderStr && typeof canRender === 'string' && (canRenderStr = canRender);
    if (canRenderStr && typeof element?.hasProp === 'function') {
        return evaluateProp(element, canRenderStr);
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
    let content = config.content || (name && element?.getProp(name)) || '';
    typeof content === 'function' && (content = content());
    return processTemplate(
        /** @type {string} **/ (content),
        element?.getPayload(element?.templateVars),
        element
    );
}

/**
 * Sets the content for a child element.
 * @param {ArpaElement} node
 * @param {string} content
 */
export function setNodeContent(node, content) {
    if (typeof content !== 'string') return;
    if (typeof node?.setContent === 'function') {
        node.setContent(content);
    } else if (node.contentNode instanceof HTMLElement) {
        node.contentNode.innerHTML = content;
    } else {
        node.innerHTML = content;
    }
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
    const canRender = canRenderNode(element, name, config, attributes);
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

/**
 * Updates or creates a child element with the specified configuration.
 * @param {ArpaElement} element
 * @param {string} name
 * @param {ArpaNodeConfigType} config
 * @returns {ArpaElement | HTMLElement | Node | null}
 */
export function spawnNode(element, name, config) {
    let node = element.templateNodes[name];
    if (node instanceof HTMLElement) {
        if (typeof config.attr === 'object') {
            attr(node, config.attr);
        }
        // @ts-ignore
        setNodeContent(node, getChildContent(element, name, config));
    } else {
        const conf = mergeObjects(element.getNodeConfig(name) || {}, config);
        const renderedNode = renderNode(renderChild(element, name, conf));
        if (renderedNode) {
            element.templateNodes[name] = renderedNode;
            node = renderedNode;
        }
    }
    return node;
}

// #endregion Template Children

////////////////////////////////
// #region Template Elements
////////////////////////////////
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

// #endregion Template Elements
