/**
 * @typedef {import('./accordion.types').AccordionConfigType} AccordionConfigType
 */
import { mergeObjects } from '@arpadroid/tools';

class Accordion {
    /** @type {AccordionConfigType} */
    config = {};
    /** @type {HTMLElement[]} */
    handlers = [];
    /** @type {HTMLElement[]} */
    listItems = [];

    _defaultConfig = {
        expandAll: false,
        closeAllOnOpen: false,
        handlerSelector: 'button',
        itemSelector: 'li',
        contentSelector: 'ul',
        isCollapsed: true,
        onHandlerClick: undefined,
        openClass: 'accordion__item--open'
    };

    /**
     * Adds accordion functionality to a node and its children.
     * @param {HTMLElement} node - The root element of the accordion.
     * @param {AccordionConfigType} config
     */
    constructor(node, config = {}) {
        if (!node) {
            throw new Error('Accordion: node is required');
        }
        this.config = mergeObjects(this._defaultConfig, config);
        this.node = node;
        this.initialize();
    }

    initializeHandlers() {
        const { handlerSelector } = this.config || {};
        if (handlerSelector && this.node) {
            this.handlers = Array.from(this.node.querySelectorAll(handlerSelector));
        }
        this.handlers?.forEach(handler => this.initializeHandler(handler));
    }

    initialize() {
        this.initializeHandlers();
        const { contentSelector, itemSelector } = this.config || {};

        if (contentSelector) {
            this.contentItems = Array.from(this.node.querySelectorAll(contentSelector));
        }
        if (itemSelector) {
            this.listItems = Array.from(this.node.querySelectorAll(itemSelector));
        }
        this.config.isCollapsed ? this.closeAllItems() : this.openAllItems();
    }

    closeAllItems() {
        this.listItems?.forEach(item => this.closeItem(item));
    }

    openAllItems() {
        this.listItems?.forEach(item => this.openItem(item));
    }

    /**
     * Initializes a handler by adding a click event listener to it.
     * @param {HTMLElement} handler
     */
    initializeHandler(handler) {
        const { itemSelector, openClass } = this.config || {};
        handler.addEventListener('click', () => {
            /** @type {HTMLElement | null } */
            const item = (itemSelector && handler.closest(itemSelector)) || null;
            this.toggleItem(item);
            const isOpen = Boolean(openClass && item?.classList.contains(openClass));
            if (item && this.config.onHandlerClick) {
                this.config.onHandlerClick(item, isOpen);
            }
        });
    }

    /**
     * Toggles the open/close state of an accordion item.
     * @param {HTMLElement | null} item
     */
    toggleItem(item) {
        if (!(item instanceof HTMLElement)) return;
        const { contentSelector, openClass } = this.config || {};
        /** @type {HTMLElement | null} */
        const content = (contentSelector && item.querySelector(contentSelector)) || null;
        if (openClass && content) {
            if (content.style.display === 'none') {
                this.openItem(item);
            } else {
                this.closeItem(item);
            }
        }
    }

    /**
     * Closes a specific accordion item.
     * @param {HTMLElement} item
     */
    closeItem(item) {
        if (!(item instanceof HTMLElement)) return;
        const { openClass, contentSelector, onClose, handlerSelector } = this.config || {};
        openClass && item.classList.remove(openClass);
        /** @type {HTMLElement | null} */
        const content = (contentSelector && item.querySelector(contentSelector)) || null;
        if (content) {
            content.style.display = 'none';
        }
        if (typeof onClose === 'function') {
            /** @type {HTMLElement | null} */
            const handler = (handlerSelector && item.querySelector(handlerSelector)) || null;
            handler && onClose && onClose(item, handler);
        }
    }

    /**
     * Opens a specific accordion item.
     * @param {HTMLElement} item
     */
    openItem(item) {
        if (!(item instanceof HTMLElement)) return;
        const { onOpen, openClass, contentSelector, handlerSelector } = this.config || {};
        openClass && item.classList.add(openClass);
        /** @type {HTMLElement | null} */
        const content = (contentSelector && item.querySelector(contentSelector)) || null;
        if (content) {
            content.style.display = '';
        }
        if (typeof onOpen === 'function') {
            /** @type {HTMLElement | null} */
            const handler = (handlerSelector && item.querySelector(handlerSelector)) || null;
            onOpen(item, handler);
        }
    }
}

export default Accordion;
