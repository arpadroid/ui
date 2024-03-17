import { dashedToCamel, mergeObjects, processTemplate } from '@arpadroid/tools';

/**
 * Base class for custom elements.
 */
class ArpaElement extends HTMLElement {
    _hasRendered = false;
    /**
     * Creates a new instance of ArpaElement.
     * @param {Record<string, unknown>} config - The configuration object for the element.
     */
    constructor(config) {
        super();
        this.setConfig(config);
        this._content = this.innerHTML;
        this._childNodes = [...this.childNodes];
        this._initialize();
    }

    /**
     * Initializes the element's internal state.
     * @private
     */
    _initialize() {}

    /**
     * Sets the configuration for the element.
     * @param {Record<string, unknown>} [config]
     */
    setConfig(config = {}) {
        this._config = mergeObjects(this.getDefaultConfig(), config);
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
        return this.getAttribute(name) || this._config[configName];
    }

    /**
     * Called when the element is connected to the DOM.
     */
    connectedCallback() {
        if (!this._hasRendered) {
            this._render();    
        }
        this._onConnected();
        this.update();
    }

    /**
     * Called when the element is connected to the DOM.
     */
    _onConnected() {
        // abstract method   
    }

    attributeChangedCallback(att, oldValue, newValue) {
        this.update();
        this._onAttributeChanged(att, oldValue, newValue);
    }

    // eslint-disable-next-line no-unused-vars
    _onAttributeChanged(att, oldValue, newValue) {
        // abstract method
    }
    

    update() {
        // abstract method
    }

    _render() {
        this.render();
        this._hasRendered = true;
    }

    /**
     * Renders the element.
     */
    render() {
        const template = this.renderTemplate();
        if (template) {
            this.innerHTML = template;
        }
    }

    /**
     * Renders the template for the element.
     * @returns {string | undefined} The rendered template.
     */
    renderTemplate() {
        const { template } = this._config;
        if (template) {
            const vars = this.getTemplateVars();
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
}

customElements.define('arpa-element', ArpaElement);

export default ArpaElement;
