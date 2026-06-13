/**
 * @typedef {import('./arpaNode.types').ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import('./arpaNode.types').ArpaNodeAttributesType} ArpaNodeAttributesType
 * @typedef {import('../arpaElement/arpaElement.js').default} ArpaElement
 */
import { defineCustomElement, getAttributes, mergeObjects, renderNode } from '@arpadroid/tools';
import { getArpaElement } from '../arpaElement/helper/arpaElement.helper';
import { renderChild } from '../arpaElement/helper/arpaElementTemplate.helper';
import { getProp } from '../arpaElement/helper/arpaElementProps.helper.js';
class ArpaNode extends HTMLElement {
    /**
     * Creates an instance of ArpaNode.
     * @param {ArpaNodeConfigType} config
     */
    constructor(config) {
        super();
        this.canRender = this.getAttribute('can-render');
        this.fragment = document.createDocumentFragment();
        this._initializeContent();
        this.setConfig(config);
    }

    _initializeContent() {
        const html = this.innerHTML.trim();
        if (html) {
            this.initialHTML = html;
            this.initialTextContent = this.textContent;
        }
        this.fragment.append(...this.childNodes);
        this._childNodes = [...this.fragment.childNodes];
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
    getProp(name) {
        return getProp(this, name);
    }

    /**
     * Register the node configuration with the parent element's template nodes in case we need to spawn it later.
     * @param {ArpaNodeConfigType} config
     * @param {ArpaNodeAttributesType} attr
     */
    registerNodeConfig(config, attr) {
        const elementPayload = {
            ...config,
            attr,
            childNodes: this._childNodes,
            locator: {
                parentNode: this.parentNode,
                nextSibling: this.nextSibling,
                previousSibling: this.previousSibling
            }
        };
        this.element?.setNodeConfig(this.getProp('name'), elementPayload);
    }

    renderNode() {
        if (!this.element) return;
        const name = this.getProp('name');
        const elementNodeConfig = this.element.getNodeConfig(name);
        const config = this.getConfig();
        const { tag } = config;
        const attr = this.getNodeAttributes();
        attr.canRender = config.canRender;

        this.registerNodeConfig(config, attr);
        if (elementNodeConfig && elementNodeConfig?.canRender === false) {
            return;
        }

        const html = renderChild(this.element, name, config, attr);
        if (tag === 'fragment') {
            this.fragment.append(html);
            return this.fragment;
        }
        const node = /** @type {HTMLElement} */ (renderNode(html));
        node?.appendChild(this.fragment);
        return node;
    }

    connectedCallback() {
        this._initializeContent();
        const name = this.getProp('name');
        if (!name) {
            const msg = 'An arpa-node must have a name attribute or configuration property defined.';
            console.error(msg, this);
            return Promise.reject(new Error(msg));
        }
        /** @type {ArpaElement | null}  */
        this.element = getArpaElement(this);
        if (!this.element) {
            const msg = 'An arpa-node must have a parent arpa-element';
            console.error(msg, this);
            return Promise.reject(new Error(msg));
        }
        if (!this.node) {
            /** @type {((HTMLElement | DocumentFragment | Node) & {arpaNode?: ArpaNode})} */
            this.node = this.renderNode();
        }

        if (this.node) {
            this.element.nodes[name] = this.node;
            this.node.arpaNode = this;
            this.replaceWith(this.node);
            this.remove();
        } else {
            this.remove();
        }
    }
}

defineCustomElement('arpa-node', ArpaNode);

export default ArpaNode;
