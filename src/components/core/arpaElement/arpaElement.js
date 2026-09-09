/**
 * @typedef {import('./arpaElement.types').ArpaElementConfigType} ArpaElementConfigType
 * @typedef {import('./arpaElement.types').ArpaElementContentNodeType} ArpaElementContentNodeType
 * @typedef {import('./arpaElement.types').TemplateContentMode} TemplateContentMode
 * @typedef {import('../arpaNode/arpaNode.types').ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import('./arpaElement.types').TemplatesType} TemplatesType
 * @typedef {import('./arpaElement.types').ArpaElementTemplateType} ArpaElementTemplateType
 * @typedef {import('./arpaElement.types').ArpaElementListenerPayloadType} ArpaElementListenerPayloadType
 * @typedef {import('../arpaNode/arpaNode').default} ArpaNode
 * @typedef {import('../arpaZone/arpaZone').default} ArpaZone
 */
import { attrString, camelToDashed, dashedToCamel, getStringBetween, mergeObjects } from '@arpadroid/tools';
import { defineCustomElement, attr, bind, classNames } from '@arpadroid/tools';
import { getCallbackProp, handleCallbackProp } from './helper/arpaElementProps.helper.js';
import { hasProp, getProp, setProp, getArrayProp } from './helper/arpaElementProps.helper.js';
import { hasZone, sanitizeAttributes } from './helper/arpaElement.helper';
import { canRender, hasContent } from './helper/arpaElement.helper';
import { renderTemplate, getClass, renderChild, renderChildNode } from './helper/arpaElementTemplate.helper';
import { selectTemplates, spawnNode } from './helper/arpaElementTemplate.helper';
import { I18nTool, I18n } from '@arpadroid/i18n';
import { DomBatcherTool } from '@arpadroid/tools';

const { arpaElementI18n } = I18nTool;

/** @type {DomBatcherTool | undefined} */
export let BATCHER;

/**
 * Returns the singleton instance of the DomBatcherTool.
 * @returns {DomBatcherTool}
 */
export function getBatcher() {
    if (!BATCHER) {
        BATCHER = new DomBatcherTool();
    }
    return BATCHER;
}

class ArpaElement extends HTMLElement {
    //////////////////////////////
    // #region Setup
    /////////////////////////////
    /** @type {(() => unknown)[]} */
    _bindings = [];
    /** @type {number | undefined} */
    _lastRendered = undefined;
    _hasRendered = false;
    _hasInitialized = false;
    _isReady = false;
    /** @type {string | null} */
    _textContent = '';
    /** @type {TemplatesType} */
    templates = {};
    /** @type {string | (() => string)} */
    $template = '';
    /** @type {Record<string, ArpaNodeConfigType>} */
    nodesConfig = {};
    /** @type {Record<string, ArpaElementContentNodeType>} */
    nodes = {};
    /** @type {Record<string, ArpaNode>} */
    arpaNodes = {};
    /** @type {Record<string, unknown>} */
    templateVars = {};
    isArpaElement = true;
    /** @type {Record<string, unknown>} */
    context = {};
    /** @type {HTMLElement | ArpaElement | string} */
    zoneTarget;
    /** @type {ArpaElementContentNodeType | null} */
    contentNode = null;

    /**
     * Creates a new instance of ArpaElement.
     * @param {ArpaElementConfigType} config - The configuration object for the element.
     */
    constructor(config) {
        super();
        this._preInitialize();
        this.setConfig(config);
        this._preInitializeContent();
        this._initializeTemplates();
        this._initializeContent();
        this.$initialize();
        this.promise = this.getPromise();
        handleCallbackProp(this, 'on-click', 'click');
    }

    _preInitialize() {
        /** @type {Record<string, ArpaElementListenerPayloadType>} */
        this.templateListeners = {};
        /** @type {(() => unknown)[]} */
        this._unsubscribes = [];
        /** @type {(() => unknown)[]} */
        this._onRenderReadyCallbacks = [];
        /** @type {(() => unknown)[]} */
        this._preRenderCallbacks = [];
        /** @type {Set<string> | undefined} */
        this.zonesByName = new Set();
        this._zones = new Set();
        this.i18nKey = dashedToCamel(this.tagName.toLowerCase());
        this.batcher = getBatcher();
        this.$preInitialize();
    }

    $preInitialize() {
        // abstract method
    }

    $initialize() {
        // abstract method
    }

    _preInitializeContent() {
        this._printAttributeList();
    }

    _printAttributeList() {
        const { attributeList = [] } = this._config;
        /** @type {Record<string, unknown>} */
        const attributes = {};
        attributeList.forEach(
            /** @param {string} attrName */ attrName => {
                if (!this.hasAttribute(attrName) && typeof this._config[attrName] !== 'undefined') {
                    attributes[camelToDashed(attrName)] = this._config[attrName];
                }
            }
        );
        if (Object.keys(attributes).length > 0) {
            attr(this, attributes);
        }
    }

    _initializeContent() {
        this._content = this.innerHTML;
        this._textContent = this.textContent;
        /** @type {Node[]} */
        this._childNodes = [...this.childNodes];
    }

    getPromise() {
        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        });
    }

    $initializeProperties() {
        return true;
    }

    $renderBlueprint() {
        let { blueprint } = this._config;
        if (typeof blueprint === 'function') {
            blueprint = blueprint.call(this);
        }
        return (blueprint || '').trim();
    }

    /**
     * Sets the configuration for the element.
     * @param {Record<string, unknown>} [config]
     * @returns {ArpaElementConfigType}
     */
    getDefaultConfig(config = this.config || {}) {
        /** @type {ArpaElementConfigType} */
        const defaultConfig = {
            className: '',
            templateContainer: this,
            handleContent: true,
            templateTypes: ['content'],
            contentPosition: 'append',
            nodesConfig: {}
        };
        return mergeObjects(defaultConfig, config);
    }

    // #endregion Setup

    /////////////////////
    // #region Get
    /////////////////////

    /**
     * Gets the template for the element.
     * @returns {(Element | Node)[]} The template for the element.
     */
    getChildElements() {
        return Array.from(this._childNodes || []).filter(node => {
            return node instanceof Element || node instanceof Node;
        });
    }

    getVariant() {
        return this.getProp('variant');
    }

    /**
     * Gets the current configuration of the element.
     * @returns {typeof this._config} The configuration object.
     */
    getConfig() {
        return this._config;
    }

    /**
     * Returns the content node for the element. If the element has template children, it returns the node marked with "is-content". Otherwise, it returns the element itself.
     * @returns {ArpaElementContentNodeType | null} The content node for the element.
     */
    getContentNode() {
        return this.nodes?.content || this.querySelector('[is-content]');
    }

    /**
     * Returns the content node for the element. If the element has template children, it returns the node marked with "is-content". Otherwise, it returns the element itself.
     * @returns {Promise<ArpaElementContentNodeType | null>} The content node for the element.
     */
    async getContentNodeAsync() {
        if (!this.nodes?.content) {
            await this.promise;
        }
        let node = this.getContentNode();
        /** @todo Remove hack with setTimeout. */
        if (!node) {
            await new Promise(resolve => setTimeout(resolve, 0));
            node = this.getContentNode();
        }
        if (!node) {
            await new Promise(resolve => setTimeout(resolve, 10));
            node = this.getContentNode();
        }
        if (node?.tagName === 'ARPA-NODE') {
            const arpaNode = /** @type {ArpaNode} */ (node);
            await arpaNode?.promise;
            if (arpaNode.node) {
                return arpaNode.node;
            }
        }
        return node || this;
    }

    /**
     * Gets the value of a property from the element's configuration or attributes.
     * @param {string} name
     * @returns {any} The value of the property.
     */
    getProp(name) {
        const rv = getProp(this, name);
        if (typeof rv === 'string' && rv.startsWith('{i18n:')) {
            const key = getStringBetween(rv, '{i18n:', '}');
            const text = key && this.i18nText(key);
            if (text) return this.i18n(key);
        }
        return rv;
    }

    /**
     * Sets the value of a property in the element's configuration and updates the corresponding attribute.
     * @param {string} name
     * @param {any} value
     * @returns {Promise<boolean>}
     */
    setProp(name, value) {
        return setProp(this, name, value);
    }

    /**
     * Gets the value of a property from the element's configuration or attributes as an array.
     * @param {string} name
     * @returns {any[]} The value of the property.
     */
    getArrayProp(name) {
        return /** @type {any[]} */ (getArrayProp(this, name));
    }

    /**
     * Gets the values of the specified properties from the element's configuration or attributes.
     * @param {...string} names
     * @returns {Record<string, unknown>} The values of the properties.
     */
    getProperties(...names) {
        /**
         * Reduces the names to an object of property values.
         * @param {Record<string, unknown>} acc
         * @param {string} name
         * @returns {Record<string, unknown>} The object of property values.
         */
        const reduce = (acc, name) => {
            acc[name] = this.getProp(name);
            return acc;
        };
        return names.reduce(reduce, {});
    }

    /**
     * Returns the base class for the element.
     * If a name is given, it is added to the class name following BEM convention.
     * @param {string} [name]
     * @returns {string}
     */
    getClassName(name) {
        let rv = this.getProp('className') || this.getAttribute('class')?.split(' ')[0];
        if (typeof name === 'string') {
            rv += `__${name}`;
        }
        return rv;
    }

    getPayload(templateVars = this.templateVars || this.getTemplateVars()) {
        return mergeObjects(this._config, templateVars);
    }

    /**
     * Gets the i18n text for the specified key.
     * @param {string} key
     * @returns {string} The i18n text.
     */
    getText(key) {
        return I18n.getText(`${this.i18nKey}.${key}`);
    }

    getZones() {
        return this._zones;
    }

    /**
     * Gets a zone from a component.
     * @param {string} name
     * @returns {ArpaZone | null} The zone or null if not found.
     */
    getZone(name) {
        if (this._zones) {
            for (const zone of this._zones) {
                if (zone.getAttribute('name') === name) return zone;
            }
        }
        return null;
    }

    /**
     * Gets the variables to be used in the template rendering.
     * @returns {Record<string, unknown>} The template variables.
     */
    getTemplateVars() {
        const { templateVars = {} } = this._config;
        return templateVars || {};
    }

    getNodesConfig() {
        return this?.nodesConfig || {};
    }

    hasNodesConfig() {
        return Object.keys(this.nodes || {}).length > 0 || Object.keys(this.getNodesConfig()).length > 0;
    }

    // #endregion get

    //////////////////////
    // #region Has
    //////////////////////

    /**
     * Determines if the element has content for the specified property.
     * @param {string} property - The name of the property.
     * @returns {boolean} True if the element has content for the specified property; otherwise, false.
     */
    hasContent(property) {
        return hasContent(this, property);
    }

    /**
     * Determines if the element has a property with the specified name.
     * @param {string} name
     * @returns {boolean | unknown} True if the element has a property with the specified name; otherwise, false.
     */
    hasProp(name) {
        return hasProp(this, name);
    }

    // #endregion Has

    ////////////////////
    // #region Set
    ////////////////////

    /**
     * Given some content in various formats, normalize it to an array of nodes.
     * @param {string | HTMLElement | NodeList | DocumentFragment | Node[]} content - The content to normalize.
     * @returns {Node[]} The normalized array of nodes.
     */
    normalizeContentNodes(content) {
        let rv = content;
        if (rv instanceof NodeList || rv instanceof HTMLCollection) {
            rv = [...rv];
        }
        if (rv instanceof DocumentFragment) {
            rv = [...rv.childNodes];
        }
        if (typeof rv === 'string') {
            const div = document.createElement('div');
            div.innerHTML = rv;
            rv = [...div.childNodes];
        } else if (rv instanceof HTMLElement) {
            rv = [rv];
        } else if (Array.isArray(rv)) {
            rv = [...rv];
        }
        return rv;
    }

    /**
     * Sets the content of the element.
     * @param {string | HTMLElement | NodeList | DocumentFragment | Node[]} content - The content to set.
     * @param {{callOnContentSet?: boolean, replace?: boolean}} [options]
     * @returns {Promise<boolean>} Returns true if the content was successfully set.
     */
    async setContent(content = [], options = {}) {
        const { callOnContentSet = true, replace = true } = options;
        const childNodes = this.normalizeContentNodes(content);
        const contentNode = await this.getContentNodeAsync();
        if (!contentNode || !childNodes) return false;
        this.contentNode = contentNode;
        this._childNodes = childNodes;
        'promise' in contentNode && (await contentNode.promise);
        replace && (contentNode.innerHTML = '');
        if (
            contentNode !== this &&
            'setContent' in contentNode &&
            typeof contentNode?.setContent === 'function'
        ) {
            await contentNode.setContent(childNodes, { callOnContentSet: true, replace: true });
        } else {
            const position = this.getProp('contentPosition') || 'append';
            if (position === 'prepend') {
                contentNode.prepend(...childNodes);
            } else if (position === 'append') {
                contentNode.append(...childNodes);
            }
        }

        callOnContentSet && this.$onContentSet();
        return true;
    }

    $onContentSet() {}

    /**
     * Called when a zone is placed in the element. Override this method to perform actions after a zone is placed.
     * @param {ArpaZone} _zone - The zone that was placed.
     * @param {Element | undefined} _container - The container element where the zone was placed.
     * @returns {undefined | boolean | void} Return false to prevent the default behavior of adding the zone contents to the container.
     */
    $onZonePlaced(_zone, _container) {}

    /**
     * Called when a zone is inserted into the element. Override this method to perform actions after a zone is inserted.
     * @param {ArpaZone} _zone - The zone that was inserted.
     * @param {Element | undefined} _container - The container element where the zone was inserted.
     * @returns {undefined | boolean | void} Return false to prevent the default behavior of adding the zone contents to the container.
     */
    $onZoneInserted(_zone, _container) {}

    // #endregion Set

    /////////////////////
    // #region Node API
    /////////////////////

    /**
     * Sets a child element.
     * @param {string} name
     * @param {ArpaNodeConfigType} [config] - The configuration object.
     */
    setNode(name, config = {}) {
        if (!name) return;
        this.setNodeConfig(name, config);
        this.spawnNode(name, config);
    }

    /**
     * Gets the configuration for a child element.
     * @returns {ArpaNodeConfigType | undefined}
     */
    getChildrenConfig() {
        return this.nodesConfig;
    }

    /**
     * Updates a child element.
     * @param {string} name
     * @param {ArpaNodeConfigType} config - The configuration object.
     * @returns {HTMLElement | Node | null}
     */
    spawnNode(name, config = {}) {
        return spawnNode(this, name, config);
    }

    /**
     * Attaches a node to the element based on the locator information in the node configuration.
     * @param {HTMLElement | Node | DocumentFragment | ArpaElement} node
     * @param {string} name
     */
    attachNode(node, name) {
        const locator = this.nodesConfig?.[name]?.locator;
        const { previousSibling, parentNode, nextSibling } = locator || {};
        if (previousSibling?.isConnected) {
            previousSibling.parentNode?.insertBefore(node, previousSibling.nextSibling);
        } else if (nextSibling?.isConnected) {
            nextSibling.parentNode?.insertBefore(node, nextSibling);
        } else if (parentNode?.isConnected) {
            parentNode.appendChild(node);
        } else {
            this.appendChild(node);
        }
    }

    /**
     * Edits a node element, spawns it if not connected.
     * @param {string} name
     * @param {ArpaNodeConfigType} [config]
     * @returns {HTMLElement | Node | null}
     */
    editNode(name, config = {}) {
        if (!name) return null;
        this.setNodeConfig(name, mergeObjects(this.getNodeConfig(name) || {}, config));
        const node = this.spawnNode(name, config);
        if (node && !node?.isConnected) {
            this.attachNode(node, name);
        }
        return node;
    }

    nodesConfigInitialized = false;

    /**
     * Returns the configuration for a node element.
     * @param {string} nodeName
     * @returns { ArpaNodeConfigType | undefined}
     */
    getNodeConfig(nodeName) {
        return this.nodesConfig?.[nodeName];
    }

    /**
     * Returns the node element with the specified name.
     * @param {string} name
     * @returns {HTMLElement | null}
     */
    getNode(name = '') {
        return /** @type {HTMLElement | null} */ (this.nodes?.[name] || null);
    }

    /**
     * Sets the configuration for a child element.
     * @param {string} nodeName
     * @param {ArpaNodeConfigType} config
     */
    setNodeConfig(nodeName, config = {}) {
        this.nodesConfig[nodeName] = config;
    }

    /**
     * Sets the configuration for a child element.
     * @param {string} nodeName
     * @param {ArpaNodeConfigType} config
     */
    addNodeConfig(nodeName, config = {}) {
        this.nodesConfig[nodeName] = mergeObjects(this.nodesConfig[nodeName] || {}, config);
    }
    // #endregion Node API

    /////////////////////
    // #region Utils
    /////////////////////

    /**
     * Computes the aria-label for the element based on its properties.
     * @param {string | unknown} content
     * @returns {string}
     */
    resolveAriaLabel(content) {
        let label = content;
        if (typeof content === 'string') {
            if (content.startsWith('<i18n-text ')) {
                const key = getStringBetween(content, 'key="', '"');
                if (key) {
                    const text = I18n.getText(key);
                    text && (label = text);
                }
            }
        }
        return String(label);
    }

    /**
     * Calls a callback function defined in the element's properties.
     * @param {string} callbackName - The name of the callback property to call.
     * @param {...any} args - The arguments to pass to the callback function.
     */
    callCallback(callbackName, ...args) {
        const cb = /** @type {((...args: any[]) => void) | undefined} */ (
            getCallbackProp(this, callbackName)
        );
        if (typeof cb === 'function') {
            cb.apply(this, args);
        }
    }

    /**
     * Applies the specified attributes to the element after sanitizing them.
     * @param {Record<string, unknown>} attributes - The attributes to apply.
     * @returns {string}
     */
    renderAttributes(attributes = this._config) {
        return attrString(sanitizeAttributes(this, attributes));
    }

    // #endregion Utils

    ////////////////////
    // #region API
    ////////////////////

    /**
     * Binds methods to the element. Each parameter is a string representing the name of the method to bind.
     * @param {string[]} args - The arguments to bind.
     */
    bind(...args) {
        bind(this, ...args);
    }

    /**
     * Returns a i18n component for the specified key.
     * @param {string} key - The key for the i18n component.
     * @param {Record<string, string>} [replacements]
     * @param {Record<string, string>} [attributes]
     * @param {string} [base] - The base key for the i18n component.
     * @returns {string} The i18n component.
     */
    i18n(key, replacements = {}, attributes = {}, base = this.i18nKey) {
        return String(arpaElementI18n(this, key, replacements, attributes, base));
    }

    /**
     * Returns the i18n text for the specified key.
     * @param {string} key
     * @param {Record<string, string>} [replacements]
     * @param {string} [base]
     * @returns {string}
     */
    i18nText(key, replacements = {}, base = this.i18nKey) {
        return I18n.getText(`${base}.${key}`, replacements);
    }

    /**
     * Sets the configuration for the element.
     * @param {ArpaElementConfigType & Record<string, unknown>} [config]
     */
    setConfig(config = {}) {
        const defaultConfig = this.getDefaultConfig();
        this._config = mergeObjects(defaultConfig, config);
        this.syncNodesConfig();
    }

    /**
     * Adds child nodes to the element.
     * @param {Node[]} nodes - The child nodes to add.
     */
    addChildNodes(nodes = []) {
        this._childNodes = [...(this._childNodes || []), ...nodes];
    }

    addConfig(config = {}) {
        this._config = mergeObjects(this._config, config);
        this.syncNodesConfig();
    }

    syncNodesConfig() {
        this.nodesConfig = mergeObjects(this.nodesConfig, this._config.nodesConfig || {});
    }

    /**
     * Deletes the property with the specified name.
     * @param {string} name
     * @returns {void}
     */
    deleteProperty(name) {
        delete this._config[dashedToCamel(name)];
        this.removeAttribute(name);
    }

    /**
     * Deletes the properties with the specified names.
     * @param {...string} names - The names of the properties to delete.
     */
    deleteProperties(...names) {
        names.forEach(name => this.deleteProperty(name));
    }

    // #endregion API

    ///////////////////////////
    // #region Templates
    //////////////////////////

    _initializeTemplates() {
        const templates = selectTemplates(this);
        templates.forEach(template => {
            const type = /** @type {TemplateContentMode | null} */ (template.getAttribute('template-type'));
            type && (this.templates[type] = template);
            template.isConnected && template.remove();
        });
    }

    // #endregion Templates

    // #endregion

    ////////////////////////
    // #region Lifecycle
    ////////////////////////

    /**
     * Called when the element is ready.
     * @returns {Promise<any>}
     */
    async onReady() {
        return Promise.resolve();
    }

    disconnectedCallback() {
        if (!this.isConnected) {
            this._unsubscribes?.forEach(unsubscribe => typeof unsubscribe === 'function' && unsubscribe());
            this._unsubscribes = [];
            this.$onDestroy();
        }
    }

    hasZone(name = '') {
        return hasZone(this, name);
    }

    $onDestroy() {}

    _addClassNames() {
        const _classes = /** @type {string[]} */ (getArrayProp(this, 'classNames')) || [];
        const classes = classNames(this.getProp('className'), _classes, this.getAttribute('class'));
        this.setAttribute('class', classes);
    }

    /**
     * Called when an attribute of the element changes.
     * @param {string} att - The name of the attribute that changed.
     * @param {string} oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(att, oldValue, newValue) {
        this.update();
        this.$onAttributeChanged(att, oldValue, newValue);
    }

    $onInitialized() {
        // abstract method
    }

    /**
     * Called when the element is connected to the DOM.
     */
    $onConnected() {
        // abstract method
    }

    /**
     * Called when an attribute of the element changes.
     * @param {string} att - The name of the attribute that changed.
     * @param {string} oldValue - The previous value of the attribute.
     * @param {string} newValue
     */
    // eslint-disable-next-line no-unused-vars
    $onAttributeChanged(att, oldValue, newValue) {
        // abstract method
    }

    update() {
        // abstract method
    }

    /**
     * Called when the element is connected to the DOM.
     * @param {boolean} [forceRender] - If true it force a renders the element even if it's not connected.
     */
    async connectedCallback(forceRender = false) {
        this._preRenderCallbacks?.forEach(callback => typeof callback === 'function' && callback());
        this._preRenderCallbacks = [];
        this._addClassNames();
        this._isReady = true;
        if (!this._hasInitialized) {
            this._hasInitialized = this.$initializeProperties();
            this._hasInitialized && this.$onInitialized();
        }

        if (forceRender || this.isConnected) {
            !this._hasRendered && (await this._render());
            await this.$onConnected();
            this.update();
        }
    }

    // #endregion

    ////////////////////////
    // #region Render
    ///////////////////////

    _preRender() {
        // abstract method
    }

    async $preRender() {
        return true;
    }

    async _render() {
        if (!this.canRender()) return;
        this._preRender();
        await this.$preRender();
        const { attributes } = this._config;
        attributes && attr(this, attributes);
        await this.render();
        this._initializeTemplateNodes();
        await this.$initializeNodes();
        this._onRenderReadyCallbacks?.forEach(callback => typeof callback === 'function' && callback());
        this._onRenderReadyCallbacks = [];
        this.$onDomReady();
        this._onRenderComplete();
    }

    _initializeTemplateNodes() {
        const conf = this.getChildrenConfig();
        if (!conf) return;
        for (const name of Object.keys(conf)) {
            const className = getClass(this, name);
            /** @type {HTMLElement | null} */
            const node = this.querySelector(`.${className}`);
            node && (this.nodes[name] = node);
        }
    }

    async $initializeNodes() {
        return true;
    }

    canRender() {
        return canRender(this);
    }

    $onDomReady() {
        // abstract method
    }

    async _onRenderComplete() {
        this._hasRendered = true;
        await this._resolveRender();
    }

    /**
     * Waits for all specified nodes to be ready.
     * @param {Record<string, ArpaElementContentNodeType>} [$nodes]
     * @param {{ onRendered?: boolean }} config
     * @returns {Promise<boolean>}
     */
    async waitForNodes($nodes = this.nodes, config = {}) {
        const { onRendered = true } = config;
        /** @type {ArpaElementContentNodeType[]} */
        const nodes = Object.values($nodes);
        for (const node of nodes) {
            if (onRendered && 'onRendered' in node && typeof node?.onRendered === 'function') {
                await node.onRendered();
            } else {
                const { promise } = this.batcher?.writes.get(node) || {};
                promise instanceof Promise && (await promise);
            }
        }
        return true;
    }

    /**
     * Waits for all specified nodes to be ready.
     * @param {Record<string, ArpaNode>} $arpaNodes
     * @returns {Promise<boolean>}
     */
    async waitForArpaNodes($arpaNodes = this.arpaNodes) {
        const arpaNodes = Object.values($arpaNodes);
        for (const arpaNode of arpaNodes) {
            await arpaNode.promise;
        }
        return true;
    }

    async onNodesReady() {
        await this.waitForArpaNodes();
        await this.waitForNodes(this.nodes);
        return true;
    }

    async _resolveRender() {
        await this.handleContent();
        await this.$resolveRender();
        await this.$onComplete();
        return this.resolvePromise?.(true);
    }

    /**
     * Resolves the render process.
     * @returns {Promise<boolean | unknown>}
     */
    async $resolveRender() {
        return true;
    }

    async handleContent() {
        if (!this.hasNodesConfig() || !this._config.handleContent || !this._childNodes?.length) {
            return false;
        }
        this.setContent(this._childNodes, { callOnContentSet: false, replace: false });
        return true;
    }

    $onComplete() {
        // abstract method
    }

    async onRendered() {
        await this.promise;
        await this.waitForNodes();
        await this.$onRendered();
        return true;
    }

    $onRendered() {
        // abstract method called after the element has been rendered
    }

    /**
     * Called when the element is ready to render.
     * @param {() => unknown} callback
     */
    onRenderReady(callback) {
        this._hasRendered ? callback() : this._onRenderReadyCallbacks?.push(callback);
    }

    /**
     * Called before the element is rendered.
     * @param {() => unknown} callback
     */
    onPreRender(callback) {
        this._hasRendered ? callback() : this._preRenderCallbacks?.push(callback);
    }

    /**
     * Renders the element.
     * @param {string} [template] - The template to render.
     * @returns {Promise<boolean>} - Returns true when rendering is complete.
     */
    async render(template = '') {
        await this._innerHTML(this.renderTemplate(template));
        return true;
    }

    /**
     * Renders a child element.
     * @param {string} name
     * @param {ArpaNodeConfigType} [options]
     * @param {Record<string, string | boolean>} [attributes]
     * @returns {string}
     */
    renderChild(name, options, attributes = {}) {
        return renderChild(this, name, options, attributes);
    }

    /**
     * Renders a node.
     * @param {string} name
     * @param {ArpaNodeConfigType & { mustRender?: boolean }} [options]
     * @param {Record<string, string | boolean>} [attributes]
     * @returns {HTMLElement | Node | null} The rendered node.
     */
    renderNode(name, options, attributes = {}) {
        return renderChildNode(this, name, options, attributes);
    }

    /**
     * Renders the template for the element.
     * @param {string} template
     * @param {Record<string, unknown>} [vars] - The variables to use in the template.
     * @returns {string} The rendered template.
     */
    renderTemplate(template, vars = this.getTemplateVars()) {
        this.templateVars = vars;
        return renderTemplate(this, template, vars);
    }

    $renderTemplate() {
        return this.$renderDefaultTemplate();
    }

    $renderDefaultTemplate() {
        let { template = this.$template } = this._config;
        if (typeof template === 'function') {
            template = template.call(this);
        }
        if (typeof template !== 'string' && this.nodesConfig) {
            template = '';
            for (const key of Object.keys(this.nodesConfig)) {
                template += `{${key}}`;
            }
        }
        return template;
    }

    async reRender() {
        this._hasRendered = false;
        this._isReady = false;
        this._initializeTemplates();
        this.promise = this.getPromise();
        return await this._render();
    }

    // #endregion

    ////////////////////////////////////
    // #region Batcher Utilities
    ///////////////////////////////////

    /**
     * Batches a remove attribute operation for the element.
     * @param {string} attr
     * @returns {Promise<void | boolean> | undefined}
     */
    _removeAttribute(attr) {
        return this.batcher?.removeAttribute(this, attr);
    }

    /**
     * Batches an innerHTML operation for the element.
     * @param {string} html
     * @returns {Promise<void | boolean> | undefined}
     */
    _innerHTML(html) {
        return this.batcher?.innerHTML(this, html);
    }

    /**
     * Sets an attribute for the element.
     * @param {string} attr
     * @param {string} value
     * @returns {Promise<void | boolean> | undefined}
     */
    _setAttribute(attr, value) {
        return this.batcher?.setAttribute(this, attr, value);
    }
}

defineCustomElement('arpa-element', ArpaElement);

export default ArpaElement;
