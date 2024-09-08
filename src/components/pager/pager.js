/**
 * @typedef {import('./pagerInterface.d.ts').PagerType} PagerType
 */
import { getURLParam, attrString, renderNode, editURL } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement.js';

const html = String.raw;
class Pager extends ArpaElement {
    //////////////////////////
    // #region INITIALIZATION
    /////////////////////////

    /** @type {Record<string, HTMLElement>} */
    pagerItems = {};

    _initialize() {
        super._initialize();
        this.onLinkClick = this.onLinkClick.bind(this);
    }

    /**
     * Returns the default configuration.
     * @returns {PagerType}
     */
    getDefaultConfig() {
        this.i18nKey = 'components.pager';
        return {
            className: 'pager',
            currentPage: 1,
            totalPages: 1,
            maxNodes: 7,
            hasArrowControls: true,
            urlParam: 'page',
            ariaLabel: this.i18nText('label')
        };
    }

    initializeProperties() {
        this.list = this.closest('.arpaList');
    }

    setConfig(config = {}) {
        config.renderMode = 'minimal';
        super.setConfig(config);
    }

    // #endregion INITIALIZATION

    ////////////////////
    // #region ACCESSORS
    ////////////////////

    set(page, totalPages) {
        this.setCurrentPage(page);
        totalPages && this.setTotalPages(totalPages);
        this.reRender();
    }

    /**
     * Assigns a function to be called when the page changes.
     * @param {(Event) => void} onClick
     */
    onChange(onClick) {
        this._config.onClick = onClick;
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
     * Sets the current page.
     * @param {number} page
     */
    setCurrentPage(page) {
        this._config.currentPage = page;
        this.setAttribute('current-page', page);
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
     * Sets the total number of pages.
     * @param {number} totalPages
     */
    setTotalPages(totalPages) {
        this._config.totalPages = totalPages;
        this.setAttribute('total-pages', totalPages);
    }

    /**
     * Determines whether the pager has arrow controls.
     * @returns {boolean}
     */
    hasArrowControls() {
        return this.hasProperty('has-arrow-controls');
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

    // #endregion ACCESSORS

    /////////////////////
    // #region RENDERING
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
        this.numbersNode = document.createElement('div');
        this.numbersNode.classList.add('pager__numbers');
        this.appendChild(this.numbersNode);
        this.renderItem(1, { onUpdate: ({ node }) => this.updateNumberItem(node) });
        hasLeftSpacer && this.addSpacer('pagerItem-spacer-left');
        this.addNumberItems(start, end);
        hasRightSpacer && this.addSpacer('pagerItem-spacer-right');
        this.renderItem(totalPages, { onUpdate: ({ node }) => this.updateNumberItem(node) });
        this.addNext(this);
    }

    /**
     * Renders a pager item.
     * @param {number} page - The page number.
     * @param {Record<string, unknown>} config - The configuration object.
     * @returns {HTMLElement} Returns the rendered pager item.
     */
    async renderItem(page, config = {}) {
        const isCurrent = this.getCurrentPage() === Number(page);
        const {
            id = `pagerItem-${page}`,
            content = page.toString(),
            isActive = this.getCurrentPage() === Number(page),
            container = this.numbersNode,
            onUpdate,
            className,
            ariaLabel
        } = config;

        let item = this.pagerItems[id];
        if (!item) {
            const attr = { page, 'is-active': isActive, class: className, ariaLabel };
            const itemHTML = html`<pager-item ${attrString(attr)}>${content}</pager-item>`;
            item = renderNode(itemHTML);
            this.pagerItems[id] = item;
        } else if (typeof onUpdate === 'function') {
            onUpdate({ isCurrent, node: item });
        }
        this._handleClick(item);
        container.appendChild(item);
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
            container: this.numbersNode,
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
            this.renderItem(i, {
                container: this.numbersNode,
                onUpdate: ({ node }) => this.updateNumberItem(node)
            });
        }
    }

    /**
     * Updates a number item.
     * @param {HTMLElement} node - The node to be updated.
     * @returns {void}
     */
    updateNumberItem(node) {
        if (Number(node.getAttribute('page')) === this.getCurrentPage()) {
            node.setAttribute('is-active', '');
            node.render(true);
        } else if (node.hasAttribute('is-active')) {
            node.removeAttribute('is-active');
            node.render(true);
        }
    }

    // #region ARROWS

    /**
     * Adds the previous page arrow control link.
     * @param {HTMLElement} container - The container to which the arrow control is added.
     */
    addPrev(container = this) {
        this.hasArrowControls() &&
            this.renderItem(this.getPrevPage(), {
                content: html`<arpa-icon>chevron_left</arpa-icon>`,
                container,
                ariaLabel: this.i18nText('lblPrev'),
                id: 'pagerItem-prev',
                className: 'pager__prev',
                ariaLabel: this.i18nText('lblPrevPage'),
                onUpdate: ({ node }) => this.updateArrowControl(node, this.getPrevPage())
            });
    }

    /**
     * Adds the next page arrow control link.
     * @param {HTMLElement} container - The container to which the arrow control is added.
     */
    addNext(container = this) {
        this.hasArrowControls() &&
            this.renderItem(this.getNextPage(), {
                content: html`<arpa-icon>chevron_right</arpa-icon>`,
                container,
                id: 'pagerItem-next',
                className: 'pager__next',
                ariaLabel: this.i18nText('lblNextPage'),
                onUpdate: ({ node }) => this.updateArrowControl(node, this.getNextPage())
            });
    }

    /**
     * Updates the arrow control link.
     * @param {HTMLElement} node
     * @param {number} page - The page number.
     */
    updateArrowControl(node, page) {
        node.setAttribute('page', page);
        const link = node.querySelector('a');
        link.href = editURL(link.href, { [this.getUrlParam()]: page });
        link.setAttribute('data-page', page);
    }

    // #endregion ARROWS

    // #endregion RENDERING

    // #region EVENTS

    /**
     * Adds click event listeners to the pager item handler nodes.
     * @param {HTMLElement} node - The node to which the event is attached.
     */
    async _handleClick(node) {
        await this.promise;
        const clickHandlers = node.querySelectorAll('a.pagerItem__content, button.pagerItem__content');
        clickHandlers.forEach(handler => handler.addEventListener('click', this.onLinkClick));
    }

    /**
     * Handles the click event on the pager item link.
     * @param {MouseEvent} event
     */
    onLinkClick(event) {
        const { onClick } = this._config;
        const pagerItem = event.target.closest('pager-item');
        onClick({ page: Number(pagerItem.getAttribute('page')), node: pagerItem, event });
        requestAnimationFrame(() => pagerItem.querySelector('a, button')?.focus());
    }

    // #endregion EVENTS
}

customElements.define('arpa-pager', Pager);

export default Pager;
