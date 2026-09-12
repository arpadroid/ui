/**
 * @typedef {import('./arpaNode.types').ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import('./arpaNode.types').ArpaNodeAttributesType} ArpaNodeAttributesType
 * @typedef {import('../arpaElement/arpaElement.types').ArpaElementContentNodeType} ArpaElementContentNodeType
 */
import { defineCustomElement, getAttributes, mergeObjects } from '@arpadroid/tools';
import { getArpaElement } from '../arpaElement/helper/arpaElement.helper';
import { renderChild } from '../arpaElement/helper/arpaElementTemplate.helper';
import { getProp } from '../arpaElement/helper/arpaElementProps.helper.js';
import ArpaElement from '../arpaElement/arpaElement.js';
class ArpaNode extends HTMLElement {
    /**
     * Creates an instance of ArpaNode.
     * @param {ArpaNodeConfigType} config
     */
    constructor(config) {
        super();
        this.canRender = this.getAttribute('can-render');
        this.fragment = document.createDocumentFragment();
        this.nodesContainer = this.closest('.template-nodes-container');
        this._initializeContent();
        this.setConfig(config);
        this.initializeElement();
        this.promise = new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        });
    }

    _initializeContent() {
        const html = this.innerHTML.trim();
        if (html) {
            this.initialHTML = html;
            this.initialTextContent = this.textContent;
        }

        this._childNodes = [...this.childNodes];
        this.fragment.append(...this.childNodes);
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
        const attr = getAttributes(this, {
            camelCaseKeys: true,
            convertFalseToBoolean: false
        });
        for (const key in this.getDefaultConfig()) {
            if (key in attr) delete attr[key];
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
    registerNodeConfig(config = this.getConfig(), attr = this.getNodeAttributes()) {
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

        const html = renderChild(this.element, name, config, attr).trim();
        if (tag === 'fragment') {
            this.fragment.append(html);
            return this.fragment;
        }
        if (!html) return;
        const template = document.createElement('template');
        template.innerHTML = html;
        const node = template.content.firstElementChild;
        node?.appendChild(this.fragment);
        return node;
    }

    async handleDefer() {
        await new Promise(resolve => requestAnimationFrame(resolve));
        let deferFn = this.getProp('defer');
        let rv = undefined;
        if (typeof deferFn === 'string') {
            deferFn = this.element?.[/** @type {keyof ArpaElement} */ (deferFn)];
        }

        if (typeof deferFn === 'function') {
            deferFn = deferFn.bind(this.element);
            rv = await deferFn({ arpaNode: this, name: this.getProp('name') });
        } else {
            await this.element?.promise;
        }
        return typeof rv !== 'undefined' ? rv : true;
    }

    /**
     * @param {ArpaElement | undefined | null} [element]
     */
    registerElement(element) {
        if (element) {
            /** @type {ArpaElement | null} */
            this.element = element;
            const name = this.getProp('name');
            element.arpaNodes[name] = this;
            if (this?.hasAttribute('is-content')) {
                element.arpaNodes.content = this;
            }
        }
    }

    initializeElement() {
        if (this.element) return;
        this.registerElement(getArpaElement(this));
    }

    async connectedCallback() {
        const name = this.getProp('name');
        if (!name) {
            const msg = 'An arpa-node must have a name attribute or configuration property defined.';
            console.error(msg, this);
            this.rejectPromise?.(new Error(msg));
            return Promise.reject(new Error(msg));
        }

        this.initializeElement();

        if (!this.element) {
            const msg = 'An arpa-node must have a parent arpa-element';
            console.error(msg, this);
            this.rejectPromise?.(new Error(msg));
            return;
        }

        if (this.hasAttribute('defer')) {
            const rv = await this.handleDefer();
            if (!rv) {
                this.remove();
                this.resolvePromise?.(true);
                return;
            }
        }

        if (!this.node) {
            this.node = /** @type {ArpaElementContentNodeType & {arpaNode?: ArpaNode}} */ (this.renderNode());
        }
        if (this.node) {
            this.node.arpaNode = this;
            this.element.nodes[name] = this.node;
            this.replaceWith(this.node);
        } else {
            this.remove();
        }
        this.resolvePromise?.(true);
    }
}

defineCustomElement('arpa-node', ArpaNode);

export default ArpaNode;
