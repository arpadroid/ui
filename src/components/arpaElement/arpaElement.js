import { dashedToCamel, mergeObjects, renderNode } from '@arpadroid/tools';
import { I18nTool } from '@arpadroid/i18n';

/**
 * Base class for custom elements.
 */
class ArpaElement extends HTMLElement {
    _hasRendered = false;
    _hasInitialized = false;
    _isReady = false;

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
        this._childNodes = [...this.childNodes];
        this._initialize();
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
        return {};
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
        const configName = dashedToCamel(name);
        return this.getAttribute(name) ?? this._config[configName];
    }

    hasProperty(name) {
        const attrVal = this.getAttribute(name);
        if (attrVal === 'false') {
            return false;
        }
        if (this.hasAttribute(name)) {
            return true;
        }
        if (typeof this._config[dashedToCamel(name)] !== 'undefined') {
            return this._config[dashedToCamel(name)];
        }
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
        this._isReady = true;
        if (!this._hasInitialized) {
            this._hasInitialized = await this.initializeProperties();
            if (this._hasInitialized) {
                this._onInitialized();
            }
        }
        if (!this.isConnected) {
            return;
        }
        if (!this._hasRendered) {
            this._render();
        }
        this._onConnected();
        this.update();
    }

    attributeChangedCallback(att, oldValue, newValue) {
        this.update();
        this._onAttributeChanged(att, oldValue, newValue);
    }

    _onInitialized() {}

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

    _render() {
        this.render();
        this._hasRendered = true;
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

customElements.define('arpa-element', ArpaElement);

export default ArpaElement;
