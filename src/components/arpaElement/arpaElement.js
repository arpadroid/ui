import { dashedToCamel, mergeObjects, renderNode, CustomElementTool } from '@arpadroid/tools';
import { slotMixin, handleSlots, camelToDashed, getAttributes, attr, extractSlots } from '@arpadroid/tools';
import { I18nTool, I18n } from '@arpadroid/i18n';
const { renderI18n, processTemplate } = I18nTool;

const { getProperty, hasProperty, getArrayProperty } = CustomElementTool;

/**
 * Base class for custom elements.
 */
class ArpaElement extends HTMLElement {
    _bindings = [];
    _hasRendered = false;
    _hasInitialized = false;
    _isReady = false;
    _onRenderedCallbacks = [];
    _slots = [];

    /////////////////////////
    // #region INITIALIZATION
    /////////////////////////
    /**
     * Creates a new instance of ArpaElement.
     * @param {Record<string, unknown>} config - The configuration object for the element.
     */
    constructor(config) {
        super();
        this.i18nKey = '';
        this._bindMethods();
        this._preInitialize();
        this.setConfig(config);
        this._initializeSlots();
        this._initializeContent();
        this._initialize();
        this.promise = this.getPromise();
    }

    _initializeSlots() {
        slotMixin(this);
    }

    _initializeContent() {
        this._content = this.innerHTML;
        this._childNodes = [...this.childNodes];
    }

    _doBindings(bindings = this._bindings, internalBindings = ['_initializeSlot']) {
        if (!this.bindingsComplete) {
            [...internalBindings, ...bindings].forEach(method => {
                if (typeof this[method] === 'function') {
                    this[method] = this[method].bind(this);
                }
            });
        }
        this.bindingsComplete = true;
    }

    _bindMethods() {}

    _preInitialize() {}

    /**
     * Initializes the element's internal state.
     * @private
     */
    _initialize() {}

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
        if (!(template instanceof HTMLTemplateElement)) {
            return;
        }
        this._config.template = template;
        attr(this, this.getTemplateAttributes());
        this.templateContent = this.getTemplateContent(template);
        this.template = document.createElement('template');
        this.template.innerHTML = this.templateContent;
        extractSlots(this.template.content, this._slots, this);
        this.templateNodes = this.template?.content?.childNodes;
        this.promise.then(() => {
            if (typeof container === 'string') {
                container = this.querySelector(container);
            }
            if (typeof container === 'function') {
                container = container();
            }
            if (container instanceof HTMLElement) {
                container.prepend(...this.templateNodes);
            }
        });
    }

    getTemplateContent(template = this._config.template, payload = this.getTemplateVars()) {
        if (template instanceof HTMLTemplateElement) {
            return I18nTool.processTemplate(template.innerHTML, payload);
        }
        return '';
    }

    // #endregion

    /////////////////////
    // #region ACCESSORS
    /////////////////////

    hasSlot(name) {
        return this._slots.find(slot => slot.getAttribute('name') === name);
    }

    getSlot(name) {
        return this._slots.find(slot => slot.getAttribute('name') === name);
    }

    i18n(key, replacements) {
        const parts = key.split('.');
        const keyLast = parts.pop();
        const attributeName = camelToDashed(keyLast);
        const configValue = this.getProperty(attributeName);
        return renderI18n(configValue ?? `${this.i18nKey}.${key}`, replacements);
    }

    i18nText(key, replacements) {
        return I18n.getText(`${this.i18nKey}.${key}`, replacements);
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
                removeEmptySlotNodes: true,
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
            contentContainer.innerHTML = '';
            contentContainer.append(...this._childNodes);
        }
    }

    getText(key) {
        return I18n.getText(`${this.i18nKey}.${key}`);
    }

    getSlots() {
        return this._slots;
    }

    // #endregion

    /////////////////////
    // #region LIFECYCLE
    /////////////////////

    async onReady() {
        return new Promise(resolve => requestAnimationFrame(resolve));
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
            this._hasInitialized = await this.initializeProperties();
            if (this._hasInitialized) {
                this._onInitialized();
            }
        }
        if (this.isConnected) {
            !this._hasRendered && this._render();
            await this._onConnected();
            this.update();
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

    _onSlotPlaced() {
        // abstract method
    }

    // #endregion

    ////////////////////
    // #region RENDERING
    ////////////////////

    async _render() {
        await this.render();
        handleSlots(() => this._onRenderComplete());
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
        if (this._hasRendered) {
            callback();
        } else {
            this._onRenderedCallbacks.push(callback);
        }
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
        this._hasInitialized = false;
        this._hasRendered = false;
        this.promise = this.getPromise();
        this.connectedCallback();
    }

    // #endregion
}

customElements.get('arpa-element') || customElements.define('arpa-element', ArpaElement);

export default ArpaElement;
