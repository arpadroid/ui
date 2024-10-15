import { getAttributes, dashedToCamel, mergeObjects, renderNode, CustomElementTool } from '@arpadroid/tools';
import { handleZones, zoneMixin, hasZone as _hasZone, attr, setNodes } from '@arpadroid/tools';
import { I18nTool, I18n } from '@arpadroid/i18n';
const { processTemplate, arpaElementI18n } = I18nTool;

const { getProperty, hasProperty, getArrayProperty } = CustomElementTool;

/**
 * Base class for custom elements.
 */
class ArpaElement extends HTMLElement {
    _bindings = [];
    _hasRendered = false;
    _hasInitialized = false;
    _isReady = false;

    ////////////////////////////
    // #region INITIALIZATION
    ///////////////////////////
    /**
     * Creates a new instance of ArpaElement.
     * @param {Record<string, unknown>} config - The configuration object for the element.
     */
    constructor(config) {
        super();
        /** @type {() => void} */
        this._unsubscribes = [];
        this._onRenderedCallbacks = [];
        this._onRenderReadyCallbacks = [];
        this.i18nKey = '';
        typeof this._bindMethods === 'function' && this._bindMethods();
        typeof this._preInitialize === 'function' && this._preInitialize();
        this.setConfig(config);
        this._initializeTemplate();
        this._initializeZones();
        this._initializeContent();
        typeof this._initialize === 'function' && this._initialize();
        this.promise = this.getPromise();
    }

    _initializeTemplate(templateNode = this.querySelector(':scope > template[template-id]')) {
        if (templateNode instanceof HTMLTemplateElement) {
            this.setTemplate(templateNode);
        }
    }

    _initializeZones() {
        zoneMixin(this);
    }

    _initializeContent() {
        this._content = this.innerHTML;
        this._childNodes = [...this.childNodes];
    }

    _doBindings(bindings = this._bindings, internalBindings = ['_initializeZone']) {
        if (!this.bindingsComplete) {
            const allBindings = new Set([...internalBindings, ...bindings]);
            allBindings.forEach(method => {
                typeof this[method] === 'function' && (this[method] = this[method].bind(this));
            });
            this.bindingsComplete = true;
        }
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
        const payload = this.getPayload();
        for (const key of Object.keys(attr)) {
            attr[key] = I18nTool.processTemplate(attr[key], payload);
        }
        return attr;
    }

    setTemplate(template, container = this) {
        this._config.template = template;
        attr(this, this.getTemplateAttributes());
        this.templateContent = this.getTemplateContent(template);
        this.template = document.createElement('template');
        this.template.innerHTML = this.templateContent;
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

    // #endregion

    /////////////////////
    // #region ACCESSORS
    /////////////////////

    hasZone(name) {
        return _hasZone(this, name);
    }

    getZone(name) {
        return _hasZone(this, name);
    }

    i18n(key, replacements, attributes, base = this.i18nKey) {
        return arpaElementI18n(this, key, replacements, attributes, base);
    }

    i18nText(key, replacements, base = this.i18nKey) {
        return I18n.getText(`${base}.${key}`, replacements);
    }

    /**
     * Sets the configuration for the element.
     * @param {Record<string, unknown>} [config]
     */
    setConfig(config = {}) {
        this._config = mergeObjects(this.getDefaultConfig(), config);
    }

    addConfig(config = {}) {
        this._config = mergeObjects(this._config, config);
    }

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
     * @returns {string} The value of the property.
     */
    getProperty(name) {
        return getProperty(this, name);
    }

    getArrayProperty(name) {
        return getArrayProperty(this, name);
    }

    getProperties(...names) {
        return names.reduce((acc, name) => {
            acc[name] = this.getProperty(name);
            return acc;
        }, {});
    }

    hasProperty(name) {
        return hasProperty(this, name);
    }

    deleteProperty(name) {
        delete this._config[dashedToCamel(name)];
        this.removeAttribute(name);
    }

    deleteProperties(...names) {
        names.forEach(name => this.deleteProperty(name));
    }

    getTagName() {
        return this.tagName.toLowerCase();
    }

    setContent(content, contentContainer = this) {
        if (typeof content === 'string') {
            this._content = content;
            this._childNodes = [renderNode(content)];
        } else if (content instanceof HTMLElement) {
            this._content = content.outerHTML;
            this._childNodes = [...content.childNodes];
        }
        if (contentContainer instanceof HTMLElement) {
            setNodes(contentContainer, this._childNodes);
        }
    }

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
        await this.onReady();
        this._addClassNames();
        this._isReady = true;
        if (!this._hasInitialized) {
            this._doBindings();
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
            typeof this._onDestroy === 'function' && this._onDestroy();
        }
    }

    _addClassNames() {
        const classes = [this._config.className ?? '', ...(this._config.classNames ?? [])].filter(Boolean);
        classes.length && this.classList.add(...classes);
    }

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
        typeof this._preRender === 'function' && this._preRender();
        await this.render();
        typeof this._initializeNodes === 'function' && this._initializeNodes();
        this._onRenderReadyCallbacks.forEach(callback => typeof callback === 'function' && callback());
        this._onRenderReadyCallbacks = [];
        this._handleZones();
        this._onRenderComplete();
    }

    _handleZones() {
        handleZones();
    }

    _onRenderComplete() {
        this._hasRendered = true;
        this._onRenderedCallbacks.forEach(callback => callback());
        this.resolvePromise?.();
        this._onComplete();
    }

    _onComplete() {
        // abstract method
    }

    onRendered(callback) {
        this._hasRendered ? callback() : this._onRenderedCallbacks.push(callback);
    }

    onRenderReady(callback) {
        this._hasRendered ? callback() : this._onRenderReadyCallbacks.push(callback);
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
     * @returns {string | undefined} The rendered template.
     */
    renderTemplate(template = this._config.template, vars = this.getTemplateVars()) {
        if (template) {
            return processTemplate(template, vars);
        }
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
