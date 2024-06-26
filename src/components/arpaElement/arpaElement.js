import { dashedToCamel, mergeObjects, renderNode } from '@arpadroid/tools';
import { I18nTool } from '@arpadroid/i18n';
import { CustomElementTool } from '@arpadroid/tools';

const { getProperty, hasProperty } = CustomElementTool;

/**
 * Base class for custom elements.
 */
class ArpaElement extends HTMLElement {
    _bindings = [];
    _hasRendered = false;
    _hasInitialized = false;
    _isReady = false;
    _onRenderedCallbacks = [];

    /////////////////////////
    // #region INITIALIZATION
    /////////////////////////
    /**
     * Creates a new instance of ArpaElement.
     * @param {Record<string, unknown>} config - The configuration object for the element.
     */
    constructor(config) {
        super();
        this._bindMethods();
        this.setConfig(config);
        this._content = this.innerHTML;
        this._extractSlots();
        this._childNodes = [...this.childNodes];
        this._initialize();
    }

    _doBindings(bindings = this._bindings) {
        bindings.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            }
        });
    }

    _bindMethods() {}

    /**
     * Initializes the element's internal state.
     * @private
     */
    _initialize() {}

    initializeProperties() {
        return true;
    }

    // #endregion

    /////////////////////
    // #region ACCESSORS
    /////////////////////

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

    getDefaultConfig() {
        return {
            removeEmptySlotNodes: true,
            className: '',
            variant: undefined,
            classNames: []
        };
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
            setTimeout(() => this._onRendered(), 10);
        }
        if (this.isConnected) {
            !this._hasRendered && this._render();
            this._onConnected();
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

    _onInitialized() {}

    onRendered(callback) {
        if (this._hasRendered) {
            callback();
        } else {
            this._onRenderedCallbacks.push(callback);
        }
    }

    _onRendered() {
        this._onRenderedCallbacks.forEach(callback => callback());
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
    // #region SLOTS
    ////////////////////

    getSlots() {
        return Array.from(this.querySelectorAll('slot'));
    }

    getSlotNodes() {
        return Array.from(this.querySelectorAll('[slot]'));
    }

    _fillSlots() {
        this._slots.forEach(slot => {
            const name = slot.getAttribute('name');
            if (name) {
                const container = this.querySelector(`[slot="${name}"]`);
                container?.append(...slot.childNodes);
            }
        });
    }

    _handleSlots() {
        this._fillSlots();
        const { removeEmptySlotNodes } = this._config;
        removeEmptySlotNodes && this._removeEmptySlotNodes();
    }

    _removeEmptySlotNodes() {
        this._slotNodes = this.getSlotNodes();
        this._slotNodes.forEach(node => !node.hasChildNodes() && node.remove());
    }

    _extractSlots() {
        this._slots = this.getSlots();
        this._slots.forEach(slot => slot.remove());
    }

    // #endregion

    ////////////////////
    // #region RENDERING
    ////////////////////

    async _render() {
        await this.render();
        this._hasRendered = true;
        this._handleSlots();
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
     * @returns {string | undefined} The rendered template.
     */
    renderTemplate(template = this._config.template) {
        if (template) {
            const vars = this.getTemplateVars();
            return I18nTool.processTemplate(template, vars);
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
        this.connectedCallback();
    }

    // #endregion
}

customElements.get('arpa-element') || customElements.define('arpa-element', ArpaElement);

export default ArpaElement;
