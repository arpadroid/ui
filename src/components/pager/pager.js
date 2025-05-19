/**
 * @typedef {import('./pager.types').PagerConfigType} PagerConfigType
 * @typedef {import('./pager.types').PagerUpdateCallbackType} PagerUpdateCallbackType
 * @typedef {import('./components/pagerItem/pagerItem.js').default} PagerItem
 * @typedef {import('../pager/components/pagerItem/pagerItem.types').PagerItemConfigType} PagerItemConfigType
 */
import { getURLParam, attrString, renderNode, editURL, defineCustomElement } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement.js';

const html = String.raw;
class Pager extends ArpaElement {
    ///////////////////////////////
    // #region Initialization
    ////////////////////////////

    /** @type {PagerConfigType} */
    _config = this._config;
    /** @type {Record<string, PagerItem>} */
    pagerItems = {};

    _initialize() {
        this.onLinkClick = this.onLinkClick.bind(this);
    }

    initializeProperties() {
        this.list = this.closest('.arpaList');
        return true;
    }

    /**
     * Sets the configuration.
     * @param {PagerConfigType} config
     */
    setConfig(config = {}) {
        config.renderMode = 'minimal';
        super.setConfig(config);
    }

    /**
     * Returns the default configuration.
     * @returns {PagerConfigType}
     */
    getDefaultConfig() {
        this.i18nKey = 'ui.pager';
        return {
            id: 'pager',
            className: 'pager',
            currentPage: 1,
            totalPages: 1,
            maxNodes: 7,
            hasArrowControls: true,
            urlParam: 'page',
            itemComponent: 'pager-item',
            ariaLabel: this.i18nText('label')
        };
    }

    // #endregion Initialization

    ////////////////////
    // #region Get
    ////////////////////

    getId() {
        return this.getProperty('id') || 'pager';
    }

    /**
     * Gets the current page.
     * @returns {number}
     */
    getCurrentPage() {
        const urlParam = this.getUrlParam();
        const currentPage = this.getProperty('current-page');
        return parseFloat(getURLParam(urlParam) ?? currentPage);
    }

    /**
     * Returns the URL parameter name that dictates the current page.
     * @returns {string}
     */
    getUrlParam() {
        return this.getProperty('url-param') ?? 'page';
    }

    /**
     * Gets the total number of pages.
     * @returns {number}
     */
    getTotalPages() {
        return parseFloat(this.getProperty('total-pages'));
    }

    /**
     * Gets the maximum number of links that the pager should display.
     * @returns {number}
     */
    getMaxNodes() {
        return parseFloat(this.getProperty('max-nodes'));
    }

    /**
     * Gets the next page.
     * @returns {number}
     */
    getNextPage() {
        let nextPage = this.getCurrentPage() + 1;
        if (nextPage > this.getTotalPages()) {
            nextPage = 1;
        }
        return nextPage;
    }

    /**
     * Gets the previous page.
     * @returns {number}
     */
    getPrevPage() {
        let prevPage = this.getCurrentPage() - 1;
        if (prevPage < 1) {
            prevPage = this.getTotalPages();
        }
        return prevPage;
    }

    getItemComponent() {
        return this.getProperty('item-component') || 'pager-item';
    }

    /**
     * Determines whether the pager has arrow controls.
     * @returns {boolean}
     */
    hasArrowControls() {
        return Boolean(this.hasProperty('has-arrow-controls'));
    }

    // #region Get

    ////////////////////
    // #region Set
    ////////////////////

    /**
     * Sets the pager.
     * @param {number} page - The current page.
     * @param {number} totalPages - The total number of pages.
     */
    setPager(page, totalPages) {
        this.setCurrentPage(page);
        totalPages && this.setTotalPages(totalPages);
        this.reRender();
    }

    /**
     * Sets the current page.
     * @param {number} page
     */
    setCurrentPage(page) {
        this._config.currentPage = page;
        this.setAttribute('current-page', String(page));
    }

    /**
     * Sets the total number of pages.
     * @param {number} totalPages
     */
    setTotalPages(totalPages) {
        this._config.totalPages = totalPages;
        this.setAttribute('total-pages', String(totalPages));
    }

    // #endregion ACCESSORS

    /////////////////////
    // #region Render
    /////////////////////

    render() {
        this.setAttribute('role', 'navigation');
        if (this._config.ariaLabel && !this.hasAttribute('aria-label')) {
            this.setAttribute('aria-label', this._config.ariaLabel);
        }
        super.render();
        this.renderPager();
    }

    renderPager() {
        const currentPage = this.getCurrentPage();
        const totalPages = this.getTotalPages();
        if (totalPages <= 1) {
            this.innerHTML = '';
            return;
        }
        const _maxNodes = this.getMaxNodes();
        let maxNodes = totalPages < _maxNodes ? totalPages : _maxNodes;
        maxNodes -= 3;
        const halfMaxNodes = Math.floor(maxNodes / 2);
        const hasLeftSpacer = totalPages - 3 > maxNodes && currentPage > maxNodes - 1;
        const hasRightSpacer = totalPages - 3 > maxNodes && currentPage < totalPages - 1 - halfMaxNodes;
        let start = currentPage - halfMaxNodes + 1;
        start < 2 && (start = 2);
        hasLeftSpacer && maxNodes--;
        hasRightSpacer && maxNodes--;
        let end = start + maxNodes;
        if (end > totalPages - 1 - halfMaxNodes) {
            end = totalPages - 1;
            start -= maxNodes - (end - start);
        }
        this.addNodes(start, end, totalPages, hasLeftSpacer, hasRightSpacer);
    }

    /**
     * Adds the pager nodes.
     * @param {number} start
     * @param {number} end
     * @param {number} totalPages
     * @param {boolean} hasLeftSpacer
     * @param {boolean} hasRightSpacer
     */
    addNodes(start, end, totalPages, hasLeftSpacer, hasRightSpacer) {
        this.innerHTML = '';
        this.addPrev(this);
        this.itemsNode = document.createElement('div');
        this.itemsNode.classList.add('pager__numbers');
        this.appendChild(this.itemsNode);
        /**
         * Updates the number item.
         * @type {PagerUpdateCallbackType}
         */
        const onUpdate = payload => this.updateNumberItem(payload.node);
        this.renderItem(1, { onUpdate });
        hasLeftSpacer && this.addSpacer('pagerItem-spacer-left');
        this.addNumberItems(start, end);
        hasRightSpacer && this.addSpacer('pagerItem-spacer-right');
        this.renderItem(totalPages, { onUpdate });
        this.addNext(this);
    }

    /**
     * Renders a pager item.
     * @param {number | undefined} page - The page number.
     * @param {PagerItemConfigType} config - The configuration object.
     * @returns {Promise<PagerItem>} Returns the rendered pager item.
     */
    async renderItem(page, config = {}) {
        const isCurrent = this.getCurrentPage() === Number(page);
        const {
            id = `pagerItem-${page}`,
            content = page?.toString(),
            isActive = this.getCurrentPage() === Number(page),
            container = this.itemsNode,
            onUpdate,
            className,
            ariaLabel
        } = config;
        let item = this.pagerItems[id];
        if (!item) {
            const attr = { page, 'is-active': isActive, class: className, ariaLabel };
            const itemComponent = this.getItemComponent();
            const itemHTML = html`<${itemComponent} ${attrString(attr)}>${content}</${itemComponent}>`;
            item = renderNode(itemHTML);
            this.pagerItems[id] = item;
        } else if (typeof onUpdate === 'function') {
            onUpdate({ isCurrent, node: item });
        }
        this._handleClick(item);
        container?.appendChild(item);
        return item;
    }

    /**
     * Adds a spacer to the pager.
     * @param {string} id
     */
    addSpacer(id = 'pagerItem-spacer') {
        this.renderItem(undefined, {
            id,
            content: '...',
            container: this.itemsNode,
            className: 'pager__spacer'
        });
    }

    /**
     * Adds the number items to the pager.
     * @param {number} start
     * @param {number} end
     */
    addNumberItems(start, end) {
        for (let i = start; i <= end; i++) {
            /**
             * Updates the number item.
             * @type {PagerUpdateCallbackType}
             */
            const onUpdate = ({ node }) => this.updateNumberItem(node);
            this.renderItem(i, {
                container: this.itemsNode,
                onUpdate
            });
        }
    }

    /**
     * Updates a number item.
     * @param {PagerItem & HTMLElement} node - The node to be updated.
     * @returns {void}
     */
    updateNumberItem(node) {
        if (Number(node.getAttribute('page')) === this.getCurrentPage()) {
            node.setAttribute('is-active', '');
            node.render(undefined, true);
        } else if (node.hasAttribute('is-active')) {
            node.removeAttribute('is-active');
            node.render(undefined, true);
        }
    }

    // #region Arrows

    /**
     * Adds the previous page arrow control link.
     * @param {Pager} container - The container to which the arrow control is added.
     */
    addPrev(container = this) {
        if (!this.hasArrowControls()) return;
        /**
         * Updates the number item.
         * @type {PagerUpdateCallbackType}
         */
        const onUpdate = ({ node }) => this.updateArrowControl(node, this.getPrevPage());
        this.renderItem(this.getPrevPage(), {
            content: html`<arpa-icon>chevron_left</arpa-icon>`,
            container,
            id: 'pagerItem-prev',
            className: 'pager__prev',
            ariaLabel: this.i18nText('lblPrevPage'),
            onUpdate
        });
    }

    /**
     * Adds the next page arrow control link.
     * @param {HTMLElement} container - The container to which the arrow control is added.
     */
    addNext(container = this) {
        if (!this.hasArrowControls()) return;
        /**
         * Updates the number item.
         * @type {PagerUpdateCallbackType}
         */
        const onUpdate = ({ node }) => this.updateArrowControl(node, this.getNextPage());
        this.renderItem(this.getNextPage(), {
            content: html`<arpa-icon>chevron_right</arpa-icon>`,
            container,
            id: 'pagerItem-next',
            className: 'pager__next',
            ariaLabel: this.i18nText('lblNextPage'),
            onUpdate
        });
    }

    /**
     * Updates the arrow control link.
     * @param {PagerItem} node
     * @param {number} page - The page number.
     */
    updateArrowControl(node, page) {
        node.setAttribute('page', String(page));
        const link = node.querySelector('a');
        if (link) {
            link.href = editURL(link.href, { [this.getUrlParam()]: page });
            link.setAttribute('data-page', String(page));
        }
    }

    // #endregion ARROWS

    // #endregion RENDERING

    // #region Events

    /**
     * Assigns a function to be called when the page changes.
     * @param {PagerConfigType['onClick']} onClick
     */
    onChange(onClick) {
        this._config.onClick = onClick;
    }

    /**
     * Adds click event listeners to the pager item handler nodes.
     * @param {ArpaElement} node - The node to which the event is attached.
     */
    async _handleClick(node) {
        await this.promise;
        node.promise && (await node.promise);
        const clickHandlers = node.querySelectorAll('a.pagerItem__content, button.pagerItem__content');
        clickHandlers.forEach(
            handler => handler instanceof HTMLElement && handler.addEventListener('click', this.onLinkClick)
        );
    }

    /**
     * Handles the click event on the pager item link.
     * @param {MouseEvent} event
     */
    onLinkClick(event) {
        const { onClick } = this._config;
        /** @type {PagerItem | null} */
        const pagerItem =
            (event?.target instanceof HTMLElement && event?.target?.closest(this.getItemComponent())) || null;
        typeof onClick === 'function' &&
            onClick({ page: Number(pagerItem?.getAttribute('page')), node: pagerItem, event });
        requestAnimationFrame(() => {
            /** @type {HTMLElement | null | undefined} */
            const focusable = pagerItem?.querySelector('a, button');
            typeof focusable?.focus === 'function' && focusable?.focus();
        });
    }

    // #endregion EVENTS
}

defineCustomElement('arpa-pager', Pager);

export default Pager;
