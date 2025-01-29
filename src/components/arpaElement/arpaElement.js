/**
 * @typedef {import('@arpadroid/tools').ZoneType} ZoneType
 * @typedef {import('./arpaElement.types').ArpaElementConfigType} ArpaElementConfigType
 * @typedef {import('@arpadroid/tools').ElementType} ElementType
 */
import { getAttributes, dashedToCamel, mergeObjects, renderNode } from '@arpadroid/tools';
import { handleZones, zoneMixin, hasZone, getZone, attr, setNodes, bind, canRender } from '@arpadroid/tools';
import { getProperty, hasProperty, getArrayProperty, hasContent, onDestroy } from '@arpadroid/tools';
import { I18nTool, I18n } from '@arpadroid/i18n';
const { processTemplate, arpaElementI18n } = I18nTool;

class ArpaElement extends HTMLElement {
    /**
     * @mixes ElementType
     */
    /** @type {(() => unknown)[]} */
    _bindings = [];
    /** @type {Set<string> | undefined} */
    zonesByName = undefined;
    /** @type {number | undefined} */
    _lastRendered = undefined;
    _hasRendered = false;
    _hasInitialized = false;
    _isReady = false;

    ////////////////////////////
    // #region INITIALIZATION
    ///////////////////////////
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
        this._initializeTemplate();
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

    _initializeTemplate(templateNode = this.querySelector(':scope > template[template-id]')) {
        if (templateNode instanceof HTMLTemplateElement) {
            this.setTemplate(templateNode);
        }
    }

    /**
     * Initializes the zones for the element.
     * @param {ElementType} [container] - The container for the zones.
     */
    _initializeZones(container) {
        zoneMixin(this, container);
    }

    _initializeContent() {
        this._content = this.innerHTML;
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

    // #endregion

    /////////////////////
    // #region TEMPLATE
    ////////////////////

    getTemplateAttributes(template = this._config.template) {
        const attr = (template && getAttributes(template)) || {};
        delete attr['template-id'];
        const payload = this.getTemplateVars();
        for (const key of Object.keys(attr)) {
            attr[key] = processTemplate(attr[key], payload);
        }
        return attr;
    }

    getPayload() {
        return this.getTemplateVars();
    }

    /**
     * Sets the template for the element.
     * @param {HTMLTemplateElement} template
     * @param {Element | string | (() => Element) | null} [container] - The container for the template.
     */
    setTemplate(template, container = this) {
        this._config.template = template;
        attr(this, this.getTemplateAttributes());
        this.templateContent = this.getTemplateContent(template);
        this.template = document.createElement('template');
        this.templateContent && (this.template.innerHTML = String(this.templateContent));
        if (typeof container === 'string') {
            container = this.querySelector(container);
        } else if (typeof container === 'function') {
            container = container();
        }
        if (container instanceof HTMLElement) {
            const fragment = document.createDocumentFragment();
            fragment.append(...this.template.content.childNodes);
            this.templateNodes = Array.from(fragment.childNodes);
            container.prepend(fragment);
        }
    }

    getTemplateContent(template = this._config.template, payload = this.getTemplateVars()) {
        return processTemplate(template.innerHTML, payload);
    }

    /**
     * Gets the template for the element.
     * @returns {(Element | Node)[]} The template for the element.
     */
    getChildElements() {
        // @ts-ignore
        return Array.from(this._childNodes || []).filter(node => {
            return node instanceof Element || node instanceof Node;
        });
    }

    // #endregion

    /////////////////////
    // #region ACCESSORS
    /////////////////////

    /**
     * Binds methods to the element. Each parameter is a string representing the name of the method to bind.
     * @param {string[]} args - The arguments to bind.
     */
    bind(...args) {
        bind(this, ...args);
    }

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
     * Gets the zone with the specified name.
     * @param {string} name
     * @returns {ZoneType | null} The zone with the specified name.
     */
    getZone(name) {
        return getZone(this, name);
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

    addConfig(config = {}) {
        this._config = mergeObjects(this._config, config);
    }

    /**
     * Sets the configuration for the element.
     * @param {ArpaElementConfigType} [config]
     * @returns {ArpaElementConfigType}
     */
    getDefaultConfig(config = {}) {
        return mergeObjects(
            {
                removeEmptyZoneNodes: true,
                className: '',
                variant: undefined,
                classNames: []
            },
            config
        );
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
     * @returns {(unknown)[]} The value of the property.
     */
    getArrayProperty(name) {
        return getArrayProperty(this, name);
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

    /**
     * Determines if the element has a property with the specified name.
     * @param {string} name
     * @returns {boolean | unknown} True if the element has a property with the specified name; otherwise, false.
     */
    hasProperty(name) {
        return hasProperty(this, name);
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

    getTagName() {
        return this.tagName.toLowerCase();
    }

    /**
     * Sets the content of the element.
     * @param {string | HTMLElement} content - The content to set.
     * @param {HTMLElement} [contentContainer] - The container for the content.
     */
    setContent(content, contentContainer = this) {
        if (typeof content === 'string') {
            this._content = content;
            this._childNodes = [renderNode(content)];
        } else if (content instanceof HTMLElement) {
            this._content = content.outerHTML;
            this._childNodes = [...content.childNodes];
        }
        if (contentContainer instanceof HTMLElement) {
            // @ts-ignore
            setNodes(contentContainer, this.getChildElements());
        }
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

    // #endregion

    /////////////////////
    // #region LIFECYCLE
    /////////////////////

    async onReady() {
        return Promise.resolve();
    }

    /**
     * Called when the element is connected to the DOM.
     */
    async connectedCallback() {
        this._preRenderCallbacks.forEach(callback => typeof callback === 'function' && callback());
        this._preRenderCallbacks = [];
        await this.onReady();
        this._addClassNames();
        this._isReady = true;
        if (!this._hasInitialized) {
            this._hasInitialized = this.initializeProperties();
            this._hasInitialized && this._onInitialized();
        }
        if (this.isConnected) {
            !this._hasRendered && this._render();
            await this._onConnected();
            this.update();
        }
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

    // #endregion

    ////////////////////
    // #region RENDERING
    ////////////////////

    async _render() {
        if (!this.canRender()) return;
        this._preRender();
        const { attributes } = this._config;
        attributes && attr(this, attributes);
        await this.render();
        typeof this._initializeNodes === 'function' && this._initializeNodes();
        this._onRenderReadyCallbacks.forEach(callback => typeof callback === 'function' && callback());
        this._onRenderReadyCallbacks = [];
        this._handleZones();
        this._onRenderComplete();
    }

    _preRender() {
        // abstract method
    }

    _initializeNodes() {
        // abstract method
    }

    canRender() {
        return canRender(this);
    }

    _handleZones() {
        handleZones();
    }

    _onRenderComplete() {
        this._hasRendered = true;
        this._onRenderedCallbacks.forEach(callback => callback());
        this.resolvePromise?.(true);
        this._onComplete();
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
        if (content) {
            this.innerHTML = content;
        }
    }

    /**
     * Renders the template for the element.
     * @param {string} [template] - The template to render.
     * @param {Record<string, unknown>} [vars] - The variables to use in the template.
     * @returns {string} The rendered template.
     */
    renderTemplate(template = this._getTemplate(), vars = this.getTemplateVars()) {
        const result = template && processTemplate(template, vars);
        return typeof result === 'string' ? result : '';
    }

    _getTemplate() {
        const { getTemplate } = this._config;
        return typeof getTemplate === 'function' ? getTemplate() : this._config?.template;
    }

    /**
     * Gets the variables to be used in the template rendering.
     * @returns {Record<string, unknown>} The template variables.
     */
    getTemplateVars() {
        return {};
    }

    reRender() {
        this._hasRendered = false;
        this.promise = this.getPromise();
        this.connectedCallback();
    }

    // #endregion
}

customElements.get('arpa-element') || customElements.define('arpa-element', ArpaElement);

export default ArpaElement;
