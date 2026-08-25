/**
 * @typedef {import('../../arpaNode/arpaNode.types').ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import('../arpaElement.types').ArpaElementBluePrintType} ArpaElementBluePrintType
 * @typedef {import('../arpaElement.types').ArpaElementListenerPayloadType} ArpaElementListenerPayloadType
 * @typedef {import("../../arpaNode/arpaNode").default} ArpaNode
 * @typedef {import("../../arpaZone/arpaZone").default} ArpaZone
 * @typedef {import("../arpaElement").default} ArpaElement
 */

import { attr, getAttributes, listen, getAttributesWithPrefix } from '@arpadroid/tools';
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

    if (!value && name.endsWith('()')) {
        const methodName = dashedToCamel(name.slice(0, -2));
        // @ts-ignore
        let method = element?.[methodName];
        if (typeof method === 'function') {
            method = method.bind(element);
            value = method();
        }
    }

    if (name.startsWith('i18n:')) {
        const i18nKey = name.slice(5);
        value = element?.i18nText(i18nKey) || value;
    }

    value = value || element?.getProp(name) || '';
    return value;
}

/**
 * Checks whether a character should be treated as template whitespace.
 * @param {string} value
 * @returns {boolean}
 */
function isTemplateWhitespace(value) {
    return /\s/.test(value || '');
}

/**
 * Parses an attribute whose value may be a single template placeholder.
 * @param {string} template
 * @param {number} lastIndex
 * @param {number} equalsIndex
 * @returns {{ attrName: string, nextIndex: number, propName: string, spacing: string, spacingStart: number } | null}
 * @todo - This is an AI solution, must be reviewed accordingly.
 */
function getTemplateAttributeMatch(template, lastIndex, equalsIndex) {
    let valueStart = equalsIndex + 1;
    while (isTemplateWhitespace(template[valueStart] || '')) {
        valueStart += 1;
    }

    const quote = template[valueStart];
    if ((quote !== '"' && quote !== "'") || template[valueStart + 1] !== '{') {
        return null;
    }

    const placeholderEnd = template.indexOf('}', valueStart + 2);
    if (placeholderEnd === -1 || template[placeholderEnd + 1] !== quote) {
        return null;
    }

    let attrEnd = equalsIndex - 1;
    while (attrEnd >= lastIndex && isTemplateWhitespace(template[attrEnd] || '')) {
        attrEnd -= 1;
    }

    let attrStart = attrEnd;
    while (attrStart >= lastIndex && !/\s|<|>|\//.test(template[attrStart] || '')) {
        attrStart -= 1;
    }
    attrStart += 1;
    if (attrStart > attrEnd) {
        return null;
    }

    let spacingStart = attrStart;
    while (spacingStart > lastIndex && isTemplateWhitespace(template[spacingStart - 1] || '')) {
        spacingStart -= 1;
    }

    return {
        attrName: template.slice(attrStart, attrEnd + 1),
        nextIndex: placeholderEnd + 2,
        propName: template.slice(valueStart + 2, placeholderEnd),
        spacing: template.slice(spacingStart, attrStart),
        spacingStart
    };
}

/**
 * Returns the event handler element for a template attribute.
 * @param {ArpaElement} element
 * @param {string} attr
 * @param {string} value
 * @returns {Promise<(Element | ArpaElement | null)[]>}
 */
export async function getTemplateEventHandlers(element, attr, value) {
    const selector = `[${attr}="{${value}}"]`;
    const handlers = new Set();
    let eventHandlers = Array.from(element.querySelectorAll(selector));
    if (!eventHandlers.length) {
        await new Promise(resolve => setTimeout(resolve, 20));
        eventHandlers = Array.from(element.querySelectorAll(selector));
    }

    for (const eventHandler of eventHandlers) {
        if (!('getProp' in eventHandler)) {
            handlers.add(eventHandler);
            continue;
        }
        const arpaHandler = /** @type {ArpaElement} */ (eventHandler);
        const eventHandlerSelector = arpaHandler.getProp('eventHandlerSelector');
        if (eventHandlerSelector) {
            await arpaHandler.promise;
            for (const handler of arpaHandler.querySelectorAll(eventHandlerSelector)) {
                handlers.add(handler);
            }
        }
    }
    return [...handlers];
}

/**
 * Applies an event listener for a template attribute.
 * @param {ArpaElement | undefined} element
 * @param {string} attr
 * @param {string} value
 * @param {(event: Event) => void | null} fn
 */
export async function applyTemplateEventListener(element, attr, value, fn) {
    if (!element) return;
    'promise' in element && (await element.promise);
    const eventHandler = await getTemplateEventHandlers(element, attr, value);
    const eventName = attr.replace('on-', '').replace(/-/g, '');
    if (typeof fn === 'function') {
        listen(eventHandler, eventName, fn);
    }
}

/**
 * Registers an event listener for a template attribute.
 * @param {ArpaElement} element
 * @param {string} attr
 * @param {string} value
 * @returns {ArpaElementListenerPayloadType | null}
 */
export function registerTemplateEventListener(element, attr, value) {
    const fnName = /** @type {keyof ArpaElement} */ (dashedToCamel(value));
    const fn = element?.[fnName];
    if (typeof fn !== 'function') return null;
    const cacheKey = `${attr}:${value}`;
    if (typeof element.templateListeners[cacheKey] === 'undefined') {
        element.templateListeners[cacheKey] = {
            fn: fn.bind(element),
            attr,
            value
        };
    }

    return element.templateListeners[cacheKey];
}

/**
 * Handles the event listener for a template attribute.
 * @param {ArpaElement} element
 * @param {string} attr
 * @param {string} value
 */
export async function handleTemplateEventListener(element, attr, value) {
    const payload = registerTemplateEventListener(element, attr, value);
    if (typeof payload?.fn === 'function') {
        applyTemplateEventListener(element, attr, value, payload?.fn);
    }
}

/**
 * Processes a template attribute token.
 * @param {string} template
 * @param {Record<string, unknown>} props
 * @param {ArpaElement} [element]
 * @returns {string}
 */
export function processTemplateAttributes(template, props = {}, element) {
    if (!template) {
        return '';
    }

    const result = [];
    let lastIndex = 0;
    let searchIndex = 0;

    while (
        (searchIndex = 'function' === typeof template.indexOf ? template.indexOf('=', searchIndex) : -1) !==
        -1
    ) {
        const match = getTemplateAttributeMatch(template, lastIndex, searchIndex);
        if (!match) {
            searchIndex += 1;
            continue;
        }
        const value = processTemplateVariable(match.propName, props[match.propName], element);
        const renderedAttribute = attrString({ [match.attrName]: value });

        if (element && !value && match.attrName.startsWith('on-')) {
            result.push(template.slice(lastIndex, match.nextIndex));
            handleTemplateEventListener(element, match.attrName, match.propName);

            lastIndex = match.nextIndex;
            searchIndex = lastIndex;
            continue;
        }
        result.push(template.slice(lastIndex, match.spacingStart));
        renderedAttribute && result.push(`${match.spacing}${renderedAttribute}`);

        lastIndex = match.nextIndex;
        searchIndex = lastIndex;
    }

    template.slice && result.push(template.slice(lastIndex));
    return result.join('');
}

/**
 * Processes a template string and replaces the placeholders with the provided props.
 * @param {string} template
 * @param {Record<string, unknown>} props
 * @param {ArpaElement} [element]
 * @returns {string}
 */
export function _processTemplate(template, props = {}, element) {
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
        // @ts-ignore
        if (!props[placeholder] && typeof element[placeholder] === 'function') {
            result.push(`{${placeholder}}`);
            startIndex = endIndex + 1;
            continue;
        }

        const val = processTemplateVariable(placeholder, props[placeholder], element);
        result.push(val);
        startIndex = endIndex + 1;
    }
    result.push(template.slice(startIndex));
    return result.join('');
}

/**
 * Processes a template string and replaces the placeholders with the provided props.
 * @param {string} template
 * @param {Record<string, unknown>} props
 * @param {ArpaElement} [element]
 * @returns {string}
 */
export function processTemplate(template, props = {}, element) {
    template = processTemplateAttributes(template, props, element);
    return _processTemplate(template, props, element);
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
export function getDefaultNodeConfig(element, name) {
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
export function getNodeAttributes(element, name, config = {}, attributes = {}) {
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
export function getNodeContent(element, name, config = {}) {
    let content = config.content || (name && element?.getProp(name)) || '';
    typeof content === 'function' && (content = content());
    const rv = processTemplate(
        /** @type {string} **/ (content),
        element?.getPayload(element?.templateVars),
        element
    );

    return rv;
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
 * @param {ArpaNodeConfigType & { mustRender?: boolean }} [config]
 * @param {Record<string, string | boolean>} [attributes]
 * @returns {string}
 */
export function renderChild(element, name, config = {}, attributes = {}) {
    const defaults = getDefaultNodeConfig(element, name);
    const { mustRender = false } = config;
    config = mergeObjects(defaults, config);
    const canRender = canRenderNode(element, name, config, attributes);

    if (mustRender || canRender) {
        typeof config.attr === 'function' && (config.attr = config.attr());
        const attr = getNodeAttributes(element, name, config, attributes);
        const { tag } = config;
        const isFragment = tag === 'fragment';
        let content = isFragment ? '' : `<${tag} ${attrString(attr)}>`;
        content += getNodeContent(element, name, config);
        content += isFragment ? '' : `</${tag}>`;
        return content;
    }
    return '';
}

/**
 * Renders a node.
 * @param {ArpaElement} element
 * @param {string} name
 * @param {ArpaNodeConfigType & { mustRender?: boolean }} [options]
 * @param {Record<string, string | boolean>} [attributes]
 * @returns {HTMLElement | Node | null} The rendered node.
 */
export function renderChildNode(element, name, options, attributes = {}) {
    const { mustRender = true } = options || {};
    const opt = { ...options, mustRender };
    const node = renderNode(renderChild(element, name, opt, attributes));
    if (node instanceof HTMLElement) {
        element.nodes[name] = node;
    }
    return node;
}

/**
 * Updates or creates a child element with the specified configuration.
 * @param {ArpaElement} element
 * @param {string} name
 * @param {ArpaNodeConfigType} config
 * @returns {import('../arpaElement.types').ArpaElementNodeType | null}
 */
export function spawnNode(element, name, config) {
    let node = element.nodes[name];
    if (node instanceof HTMLElement) {
        if (typeof config.attr === 'object') {
            attr(node, config.attr);
        }
        // @ts-ignore
        setNodeContent(node, getNodeContent(element, name, config));
        return node;
    }
    const conf = mergeObjects(element.getNodeConfig(name) || {}, config);

    const renderedNode = renderChildNode(element, name, conf);
    if (renderedNode) {
        element.nodes[name] = /** @type {HTMLElement} */ (renderedNode);
        node = /** @type {HTMLElement} */ (renderedNode);
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
 * Returns the configuration for the nodes defined in the template.
 * @param {ArpaElement} element
 * @param {string} [blueprint]
 */
export function getNodesConfigBlueprint(element, blueprint) {
    blueprint = String(blueprint || element.$renderBlueprint() || '');
    const tpl = document.createElement('template');
    tpl.innerHTML = blueprint;
    /** @type {ArpaNode[]} */
    const arpaNodes = Array.from(tpl.content.querySelectorAll('arpa-node') || []);
    const arpaNodeAttrNames = [
        'can-render',
        'class-name',
        'must-render',
        'has-zone',
        'id',
        'name',
        'tag',
        'zone-name',
        'zone-target'
    ];
    arpaNodes.forEach(node => {
        const name = node.getAttribute('name');
        if (!name) return;
        const attr = getAttributes(node);
        /** @type {ArpaNodeConfigType} */
        const cnf = {
            attr: {},
            content: node.innerHTML
        };
        Object.keys(attr).forEach(key => {
            if (arpaNodeAttrNames.includes(key)) {
                // @ts-ignore
                cnf[dashedToCamel(key)] = attr[key];
            } else {
                // @ts-ignore
                cnf.attr[key] = attr[key];
            }
        });
        element.setNodeConfig(name, mergeObjects(element.getNodeConfig(name), cnf));
    });
}

/**
 * Renders the template for the element.
 * @param {ArpaElement} component
 * @param {string | null} [_template]
 * @param {Record<string, unknown>} [vars]
 * @returns {string}
 */
export function renderTemplate(component, _template, vars = component.getTemplateVars()) {
    getNodesConfigBlueprint(component);
    const tplNode = component.templates?.content;
    const templateContent = tplNode?.innerHTML?.trim() || '';
    const templateMode = tplNode?.getAttribute('template-mode') || 'content';
    let template = _template || templateContent || component?.$renderTemplate() || '';
    if (templateMode === 'append') {
        template = _template || `${templateContent}${component?.$renderTemplate() || ''}` || '';
    }

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
 * Sets the template for the element.
 * @template {ArpaElement} T
 * @param {T} element
 * @param {import('../arpaElement.types').ArpaElementTemplateType} template
 * @param {import('../arpaElement.types').ApplyTemplateConfigType} [payload]
 */
export async function applyTemplate(element, template, payload = {}) {
    if (template instanceof HTMLTemplateElement) {
        applyTemplateAttributes(element, template, payload);
        // const templateMode = template?.getAttribute('template-mode') || 'content';
        getNodesConfigBlueprint(element);
        element.templates.content = template;
    }
}

// #endregion Template Elements
