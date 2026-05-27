/**
 * @typedef {import('./arpaNode.types').ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import('./arpaNode.types').ArpaNodeAttributesType} ArpaNodeAttributesType
 */
import { defineCustomElement, getAttributes, mergeObjects, renderNode } from '@arpadroid/tools';
import { getProperty } from '../arpaElement/helper/arpaElement.helper';
import ArpaElement from '../arpaElement/arpaElement.js';
import { renderChild } from './arpaNode.helper';

class ArpaNode extends HTMLElement {
    /**
     * Creates an instance of ArpaNode.
     * @param {ArpaNodeConfigType} config
     */
    constructor(config) {
        super();
        this.fragment = document.createDocumentFragment();
        this._initializeContent();
        this.setConfig(config);
    }

    _initializeContent() {
        this.initialTextContent = this.textContent;
        this.initialHTML = this.innerHTML.trim();
        this._childNodes = [...this.childNodes];
        this.fragment.append(...this._childNodes);
    }

    /**
     * Sets the configuration for the ArpaNode component.
     * @param {ArpaNodeConfigType} config
     */
    setConfig(config) {
        /** @type {ArpaNodeConfigType} */
        this._config = mergeObjects(this.getDefaultConfig(), config);
    }

    /**
     * Returns the default configuration for the ArpaNode component.
     * @returns {ArpaNodeConfigType}
     */
    getDefaultConfig() {
        /** @type {ArpaNodeConfigType} */
        const config = {
            attr: {},
            canRender: true,
            childNodes: this._childNodes,
            hasZone: true,
            name: undefined,
            tag: 'div',
            zoneName: undefined
        };

        return config;
    }

    /**
     * Returns the parent ArpaElement of the node.
     * @returns {ArpaElement | null}
     */
    getElement() {
        let node = this.parentElement;
        while (node) {
            // @ts-ignore
            if (node?.isArpaElement) {
                return /** @type {ArpaElement} */ (node);
            }
            node = node.parentElement;
        }
        return null;
    }

    getNodeAttributes() {
        const attr = getAttributes(this, { camelCaseKeys: true });
        for (const key in this.getDefaultConfig()) {
            if (key in attr) {
                delete attr[key];
            }
        }
        const { attr: configAttr = {} } = this._config || {};
        return mergeObjects(configAttr, attr);
    }

    getConfig() {
        const config = getAttributes(this, {
            camelCaseKeys: true
        });
        // Remove any keys that are not in the default config.
        const defaultConfig = this.getDefaultConfig();
        for (const key in config) {
            if (!(key in defaultConfig)) {
                delete config[key];
            }
        }
        if (!config.zoneName) {
            config.zoneName = config.name;
        }

        return mergeObjects(this._config, config);
    }

    /**
     * Returns the value of a property from the element's configuration or attributes.
     * @param {string} name
     * @returns {any}
     */
    getProperty(name) {
        return getProperty(this, name);
    }

    renderNode() {
        if (!this.element) return;
        const name = this.getProperty('name');
        const config = this.getConfig();
        const attr = this.getNodeAttributes();
        attr.canRender = config.canRender;
        const html = renderChild(this.element, name, config, attr);
        const node = /** @type {HTMLElement} */ (renderNode(html));
        node?.appendChild(this.fragment);
        return node;
    }

    async connectedCallback() {
        const name = this.getProperty('name');
        if (!name) {
            throw new Error('An arpa-node must have a name attribute or configuration property defined.');
        }
        this.element = this.getElement();
        if (!this.element) {
            throw new Error('An arpa-node must have a parent arpa-element');
        }
        /** @type {HTMLElement & {arpaNode?: ArpaNode}} */
        this.node = this.renderNode();
        if (this.node) {
            this.node.arpaNode = this;
            this.replaceWith(this.node);
        } else {
            this.remove();
        }
    }
}

defineCustomElement('arpa-node', ArpaNode);

export default ArpaNode;
