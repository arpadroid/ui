/**
 * @typedef {import('@arpadroid/tools').ZoneType} ZoneType
 * @typedef {import('./arpaElement.types').ArpaElementConfigType} ArpaElementConfigType
 * @typedef {import('@arpadroid/tools').ElementType} ElementType
 * @typedef {import('@arpadroid/tools').CustomElementChildOptionsType} CustomElementChildOptionsType
 * @typedef {import('./arpaElement.types').TemplateContentMode} TemplateContentMode
 * @typedef {import('./arpaElement.types').TemplatesType} TemplatesType
 * @typedef {import('./arpaElement.types').ArpaElementTemplateType} ArpaElementTemplateType
 */
import { dashedToCamel, mergeObjects, renderNode, processTemplate } from '@arpadroid/tools';
import { handleZones, zoneMixin, hasZone, getZone, attr, setNodes, canRender } from '@arpadroid/tools';
import { getProperty, hasProperty, getArrayProperty, hasContent, onDestroy, bind } from '@arpadroid/tools';
import { renderChild, defineCustomElement, getAttributesWithPrefix, resolveNode } from '@arpadroid/tools';
import { I18nTool, I18n } from '@arpadroid/i18n';
const { arpaElementI18n } = I18nTool;

class ArpaElement extends HTMLElement {
    //////////////////////////////
    // #region Setup
    /////////////////////////////
    /** @type {(() => unknown)[]} */
    _bindings = [];
    /** @type {Set<string> | undefined} */
    zonesByName = undefined;
    /** @type {number | undefined} */
    _lastRendered = undefined;
    _hasRendered = false;
    _hasInitialized = false;
    _isReady = false;
    /** @type {TemplatesType} */
    templates = {};

    /**
     * Creates a new instance of ArpaElement.
     * @param {ArpaElementConfigType} config - The configuration object for the element.
     */
    constructor(config) {
        super();
        /** @type {(() => unknown)[]} */
        this._unsubscribes = [];
        /** @type {(() => unknown)[]} */
        this._onRenderedCallbacks = [];
        /** @type {(() => unknown)[]} */
        this._onRenderReadyCallbacks = [];
        /** @type {(() => unknown)[]} */
        this._preRenderCallbacks = [];
        this._zones = new Set();
        this.i18nKey = '';
        this._preInitialize();
        this.setConfig(config);
        this._initializeTemplates();
        this._initializeZones();
        this._initializeContent();
        this._initialize();
        this.promise = this.getPromise();
    }

    _preInitialize() {
        // abstract method
    }

    _initialize() {
        // abstract method
    }

    _initializeProperties() {
        // abstract method
    }

    /**
     * Initializes the zones for the element.
     */
    _initializeZones() {
        zoneMixin(this);
    }

    _initializeContent() {
        this._content = this.innerHTML;
        /** @type {Node[]} */
        this._childNodes = [...this.childNodes];
    }

    getPromise() {
        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        });
    }

    initializeProperties() {
        return true;
    }

    /**
     * Sets the configuration for the element.
     * @param {Record<string, unknown>} [config]
     * @returns {ArpaElementConfigType}
     */
    getDefaultConfig(config = {}) {
        /** @type {ArpaElementConfigType} */
        const defaultConfig = {
            removeEmptyZoneNodes: true,
            className: '',
            variant: undefined,
            templateContainer: this,
            templateTypes: ['add', 'content', 'list-item', 'prepend', 'append']
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
        return this.getProperty('variant');
    }

    /**
     * Gets the current configuration of the element.
     * @returns {Record<string, unknown>} The configuration object.
     */
    getConfig() {
        return this._config;
    }

    /**
     * Gets the value of a property from the element's configuration or attributes.
     * @param {string} name
     * @returns {any} The value of the property.
     */
    getProperty(name) {
        return getProperty(this, name);
    }

    /**
     * Gets the value of a property from the element's configuration or attributes as an array.
     * @param {string} name
     * @returns {any[]} The value of the property.
     */
    getArrayProperty(name) {
        return /** @type {any[]} */ (getArrayProperty(this, name));
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
            acc[name] = this.getProperty(name);
            return acc;
        };
        return names.reduce(reduce, {});
    }

    getTagName() {
        return this.tagName.toLowerCase();
    }

    /**
     * Gets the zone with the specified name.
     * @param {string} name
     * @returns {ZoneType | null} The zone with the specified name.
     */
    getZone(name) {
        return getZone(this, name);
    }

    getClassName() {
        return this._config.className || this.getAttribute('class')?.split(' ')[0];
    }

    getPayload() {
        return this.getTemplateVars();
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
     * Gets the variables to be used in the template rendering.
     * @returns {Record<string, unknown>} The template variables.
     */
    getTemplateVars() {
        return {};
    }

    // #endregion get

    //////////////////////
    // #region Has
    //////////////////////

    /**
     * Determines if the element has a zone with the specified name.
     * @param {string} name
     * @returns {boolean} True if the element has a zone with the specified name; otherwise, false.
     */
    hasZone(name) {
        return hasZone(this, name);
    }

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
    hasProperty(name) {
        return hasProperty(this, name);
    }

    // #endregion Has

    ////////////////////
    // #region Set
    ////////////////////

    /**
     * Sets the content of the element.
     * @param {string | HTMLElement} content - The content to set.
     * @param {HTMLElement} [contentContainer] - The container for the content.
     */
    setContent(content, contentContainer = this) {
        if (typeof content === 'string') {
            this._content = content;
            const node = renderNode(content);
            this._childNodes = node ? [node] : [];
        } else if (content instanceof HTMLElement) {
            this._content = content.outerHTML;
            this._childNodes = [...content.childNodes];
        }
        if (contentContainer instanceof HTMLElement) {
            const childElements = /** @type {Element[]} */ (this.getChildElements());
            setNodes(contentContainer, childElements);
        }
    }

    // #endregion Set

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
     * @param {ArpaElementConfigType} [config]
     */
    setConfig(config = {}) {
        this._config = mergeObjects(this.getDefaultConfig(), config);
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
        const templates = this._selectTemplates();
        templates.forEach(template => {
            const type = /** @type {TemplateContentMode | null} */ (template.getAttribute('type'));
            type && (this.templates[type] = template);
            template.isConnected && template.remove();
        });
        
        const viewTemplates = this._selectViewTemplates();
        if (viewTemplates.length) {
            this.templates.views = viewTemplates;
        }
        viewTemplates.forEach(template => template.remove());
    }

    /**
     * Selects the templates for the element.
     * @param {string} [templateSelector] - The selector for the templates.
     * @returns {HTMLTemplateElement[]} The selected templates.
     */
    _selectTemplates(templateSelector = this._getTemplatesSelector()) {
        return (templateSelector && Array.from(this.querySelectorAll(templateSelector))) || [];
    }

    _selectViewTemplates() {
        return Array.from(this.querySelectorAll(':scope > template[type="view"]'));
    }

    _getTemplatesSelector() {
        const templateTypes = this.getArrayProperty('template-types');
        if (!templateTypes?.length) return;
        return templateTypes.map(type => `:scope > template[type="${type}"]`).join(', ');
    }

    /**
     * Sets the template for the element.
     * @param {ArpaElementTemplateType} template
     * @param {import('./arpaElement.types').ApplyTemplateConfigType} [config]
     */
    async applyTemplate(template, config = {}) {
        const { contentMode = template.getAttribute('type') } = config;
        const container = this.getTemplateContainer(template);
        if (!(container instanceof HTMLElement)) {
            console.error('Invalid template container', container);
            return;
        }
        const attributes = getAttributesWithPrefix(template, 'element-');
        attr(container, attributes);
        const content = this.getTemplateContent(template);
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

    /**
     * Returns HTML container for the template.
     * @param {ArpaElementTemplateType} template
     * @returns {HTMLElement | Element | DocumentFragment | null}
     */
    getTemplateContainer(template) {
        let container = template.getAttribute('container') || this.getProperty('template-container');
        typeof container === 'function' && (container = container());
        const resolved = resolveNode(container);
        if (!(resolved instanceof HTMLElement)) {
            console.error('Invalid template container', resolved);
            return this;
        }
        return resolved;
    }

    /**
     * Gets the content of the template for the element.
     * @param {HTMLTemplateElement} template
     * @param {Record<string, unknown>} [payload]
     * @returns {string}
     */
    getTemplateContent(template = this._config.template, payload = this.getTemplateVars()) {
        return processTemplate(template.innerHTML, payload);
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
            this._onDestroy();
        }
    }

    _onDestroy() {
        onDestroy(this);
    }

    _addClassNames() {
        const classes = [this._config.className ?? '', ...(this._config.classNames ?? [])].filter(Boolean);
        classes.length && this.classList.add(...classes);
    }

    /**
     * Called when an attribute of the element changes.
     * @param {string} att - The name of the attribute that changed.
     * @param {string} oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(att, oldValue, newValue) {
        this.update();
        this._onAttributeChanged(att, oldValue, newValue);
    }

    _onInitialized() {
        // abstract method
    }

    /**
     * Called when the element is connected to the DOM.
     */
    _onConnected() {
        // abstract method
    }

    /**
     * Called when an attribute of the element changes.
     * @param {string} att - The name of the attribute that changed.
     * @param {string} oldValue - The previous value of the attribute.
     * @param {string} newValue
     */
    // eslint-disable-next-line no-unused-vars
    _onAttributeChanged(att, oldValue, newValue) {
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
        this._preRenderCallbacks.forEach(callback => typeof callback === 'function' && callback());
        this._preRenderCallbacks = [];
        await this.onReady();
        this._addClassNames();
        this._isReady = true;
        if (!this._hasInitialized) {
            this._hasInitialized = this.initializeProperties();
            this._hasInitialized && this._onInitialized();
        }

        if (forceRender || this.isConnected) {
            !this._hasRendered && this._render();
            await this._onConnected();
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

    async _render() {
        if (!this.canRender()) return;
        this._preRender();
        const { attributes } = this._config;
        attributes && attr(this, attributes);
        await this.render();
        await this._initializeNodes();
        this._onDomReady();
        this._onRenderReadyCallbacks.forEach(callback => typeof callback === 'function' && callback());
        this._onRenderReadyCallbacks = [];
        this._handleZones();
        this._onRenderComplete();
    }

    async _initializeNodes() {
        return true;
    }

    canRender() {
        return canRender(this);
    }

    _handleZones() {
        handleZones();
    }

    _onDomReady() {
        // abstract method
    }

    async _onRenderComplete() {
        this._hasRendered = true;
        this._onRenderedCallbacks.forEach(callback => callback());
        await this._resolveRender();
        this._onComplete();
    }

    async _resolveRender() {
        return this.resolvePromise?.(true);
    }

    _onComplete() {
        // abstract method
    }

    /**
     * Called when the element has finished rendering.
     * @param {() => unknown} callback
     */
    onRendered(callback) {
        this._hasRendered ? callback() : this._onRenderedCallbacks.push(callback);
    }

    /**
     * Called when the element is ready to render.
     * @param {() => unknown} callback
     */
    onRenderReady(callback) {
        this._hasRendered ? callback() : this._onRenderReadyCallbacks.push(callback);
    }

    /**
     * Called before the element is rendered.
     * @param {() => unknown} callback
     */
    onPreRender(callback) {
        this._hasRendered ? callback() : this._preRenderCallbacks.push(callback);
    }

    /**
     * Renders the element.
     */
    render() {
        const content = this.renderTemplate();
        content && (this.innerHTML = content);
    }

    /**
     * Renders a child element.
     * @param {string} name
     * @param {CustomElementChildOptionsType} [options]
     * @returns {string}
     */
    renderChild(name, options) {
        return renderChild(this, name, options);
    }

    /**
     * Renders the template for the element.
     * @param {string} [_template] - The template to render.
     * @param {Record<string, unknown>} [vars] - The variables to use in the template.
     * @returns {string} The rendered template.
     */
    renderTemplate(_template, vars = this.getTemplateVars()) {
        const templateContent = this.templates?.content?.innerHTML.trim();
        const template = _template || templateContent || this._getTemplate();
        for (const tplVar of Object.keys(vars)) {
            if (typeof vars[tplVar] === 'string') {
                vars[tplVar] = processTemplate(vars[tplVar], vars);
            }
        }
        const result = template && processTemplate(template, vars);
        return typeof result === 'string' ? result : '';
    }

    _getTemplate() {
        const { getTemplate } = this._config;
        return typeof getTemplate === 'function' ? getTemplate() : this._config?.template;
    }

    reRender() {
        this._hasRendered = false;
        this.promise = this.getPromise();
        this.connectedCallback();
    }

    // #endregion
}

defineCustomElement('arpa-element', ArpaElement);

export default ArpaElement;
