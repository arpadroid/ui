/**
 * @typedef {import('./pager.types').PagerConfigType} PagerConfigType
 * @typedef {import('./pager.types').PagerUpdateCallbackType} PagerUpdateCallbackType
 */
import { getURLParam, observerMixin, editURL, mergeObjects, sanitizeURL, classNames } from '@arpadroid/tools';
import { defineCustomElement, dummySignal, dummyListener, dummyOff, mapHTML, $attr } from '@arpadroid/tools';
import ArpaElement from '../core/arpaElement/arpaElement.js';

const html = String.raw;
class Pager extends ArpaElement {
    /** @type {PagerConfigType} */
    _config = this._config;

    /**
     * @param {PagerConfigType} config
     */
    constructor(config) {
        super(config);
        this.bind('onLinkClick');
        this.signal = dummySignal;
        this.on = dummyListener;
        this.off = dummyOff;
        observerMixin(this);
    }

    async $initializeProperties() {
        this.list = this.closest('.arpaList');
        return true;
    }

    /**
     * @returns {PagerConfigType}
     */
    getDefaultConfig() {
        this.i18nKey = 'ui.pager';
        /** @type {PagerConfigType} */
        const config = {
            id: 'pager',
            className: 'pager',
            currentPage: 1,
            totalPages: 1,
            maxNodes: 7,
            hasArrowControls: false,
            prevIcon: 'chevron_left',
            nextIcon: 'chevron_right',
            lblNextPage: this.i18nText('lblNextPage'),
            lblPrevPage: this.i18nText('lblPrevPage'),
            urlParam: 'page',
            spacerContent: '...',
            ariaLabel: this.i18nText('label'),
            fastRender: true
        };
        return mergeObjects(super.getDefaultConfig(), config);
    }

    ////////////////////
    // #region Get
    ////////////////////

    getId() {
        return this.getProp('id') || 'pager';
    }

    getCurrentPage() {
        const urlParam = this.getUrlParam();
        const currentPage = this.getProp('current-page');
        return parseFloat(getURLParam(urlParam) ?? currentPage);
    }

    getUrlParam() {
        return this.getProp('url-param') ?? 'page';
    }

    getTotalPages() {
        return parseFloat(this.getProp('total-pages'));
    }

    getMaxNodes() {
        return parseFloat(this.getProp('max-nodes'));
    }

    getNextPage() {
        let nextPage = this.getCurrentPage() + 1;
        if (nextPage > this.getTotalPages()) {
            nextPage = 1;
        }
        return nextPage;
    }

    getPrevPage() {
        let prevPage = this.getCurrentPage() - 1;
        if (prevPage < 1) {
            prevPage = this.getTotalPages();
        }
        return prevPage;
    }

    /**
     * @param {number} page
     * @returns {string}
     */
    getLink(page) {
        const urlParam = this.getUrlParam();
        return editURL(sanitizeURL(window.location.href), {
            [urlParam || 'page']: page
        });
    }

    /**
     * @param {number} page
     * @returns {string}
     */
    getItemTag(page) {
        if (Number(page) === Number(this.getCurrentPage())) {
            return 'div';
        }
        return 'a';
    }

    /**
     * @param {number | string} page
     * @returns {boolean}
     */
    hasInput(page) {
        const totalPages = this.getTotalPages() || 0;
        const maxNodes = Number(this.getProp('maxNodes')) || 0;
        return totalPages > maxNodes && Number(page) === Number(this.getCurrentPage());
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
    async setPager(page, totalPages) {
        const focused = document.activeElement;
        this.setCurrentPage(page);
        totalPages && this.setTotalPages(totalPages);
        this.nodes = {};
        this.arpaNodes = {};

        this.reRender();
        await this.onRendered();
        await this.promise;
        if (focused instanceof HTMLElement) {
            if (focused.classList.contains('pager__prevControl')) {
                if (this.nodes.prevControl instanceof HTMLElement) {
                    this.nodes.prevControl?.focus();
                }
            } else if (focused.classList.contains('pager__nextControl')) {
                if (this.nodes.nextControl instanceof HTMLElement) {
                    this.nodes.nextControl?.focus();
                }
            } else if (
                focused.classList.contains('pager__item') ||
                focused.classList.contains('pager__input')
            ) {
                this.focusInput();
            }
        }
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

    // #endregion Set

    /////////////////////
    // #region Render
    /////////////////////

    _preRender() {
        super._preRender();
        this.setAttribute('role', 'navigation');
        const { ariaLabel } = this._config;
        if (ariaLabel && !this.hasAttribute('aria-label')) {
            this.setAttribute('aria-label', ariaLabel);
        }
    }

    /**
     * Computes the pager nodes.
     * @returns {import('./pager.types').PagerComputeResult | null}
     */
    computePager() {
        const currentPage = this.getCurrentPage();
        const totalPages = this.getTotalPages();
        if (totalPages <= 1) {
            return null;
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
        return { start, end, totalPages, hasLeftSpacer, hasRightSpacer };
    }

    $renderBlueprint() {
        const {
            start = 0,
            end = 1,
            totalPages,
            hasLeftSpacer = false,
            hasRightSpacer = false
        } = this.computePager() || { totalPages: 0 };

        if (totalPages <= 1) return '';
        const nodeRange = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        return html`
            <arpa-node
                name="prevControl"
                tag="a"
                aria-label="{lblPrevPage}"
                class="pager__item"
                can-render="hasArrowControls"
                href="${this.getLink(this.getPrevPage())}"
                data-page="{getPrevPage()}"
                on-click="{onLinkClick}"
            >
                <arpa-icon>{prevIcon}</arpa-icon>
            </arpa-node>

            <arpa-node name="items" tag="div">
                ${this.renderPageItem(1)}

                <arpa-node name="leftSpacer" tag="span" class="pager__spacer" can-render="${hasLeftSpacer}">
                    {spacerContent}
                </arpa-node>

                ${mapHTML(nodeRange, index => this.renderPageItem(index))}

                <arpa-node name="rightSpacer" tag="span" class="pager__spacer" can-render="${hasRightSpacer}">
                    {spacerContent}
                </arpa-node>

                ${this.renderPageItem(totalPages)}
            </arpa-node>
            <arpa-node
                name="nextControl"
                tag="a"
                on-click="{onLinkClick}"
                class="pager__item"
                aria-label="{lblNextPage}"
                can-render="hasArrowControls"
                href="${this.getLink(this.getNextPage())}"
                data-page="{getNextPage()}"
            >
                <arpa-icon>{nextIcon}</arpa-icon>
            </arpa-node>
        `;
    }

    $renderTemplate() {
        return html`{prevControl}{items}{nextControl}`;
    }

    /**
     * Checks if a page is active.
     * @param {number} page
     * @returns {boolean}
     */
    isActive(page) {
        return this.getCurrentPage() == Number(page);
    }

    /**
     * Renders a page item.
     * @param {number} page
     * @returns {string}
     */
    renderPageItem(page) {
        const tag = this.getItemTag(page);
        const link = this.getLink(page);
        const hasInput = this.hasInput(page);
        return html`<arpa-node
            name="page${page}"
            class="${classNames(['pager__item', { pager__inputContainer: hasInput }])}"
            tag="${tag}"
            data-page="${page}"
            href="${link}"
            ${$attr({
                'is-active': this.isActive(page),
                'on-click': hasInput ? undefined : '{onLinkClick}'
            })}
        >
            ${(!hasInput && page) || ''} ${this.renderInput(page)}
        </arpa-node>`;
    }

    /**
     * @param {number} page
     * @returns {string}
     */
    renderInput(page) {
        if (!this.hasInput(page)) return '';
        return html`
            <arpa-node
                name="inputForm"
                tag="arpa-form"
                id="pager-item-input--${this.getId()}"
                class="pagerItem__form"
                variant="mini"
                on-submit="{onSubmitInput}"
            >
                <input
                    class="pager__input"
                    name="${this.getUrlParam()}"
                    aria-label="Current page"
                    type="number"
                    value="${page}"
                    placeholder="${page}"
                    min="1"
                    max="${this.getTotalPages()}"
                />
            </arpa-node>
        `;
    }

    //////////////////////
    // #region Events
    /////////////////////

    /**
     * Assigns a function to be called when the page changes.
     * @param {PagerConfigType['onClick']} onClick
     */
    onChange(onClick) {
        this._config.onClick = onClick;
    }

    /**
     * Handles the submit event.
     * @param {Event} event - The event object.
     */
    onSubmitInput(event) {
        event.preventDefault();
        const form = event.target;
        if (form instanceof HTMLFormElement) {
            const input = form?.querySelector('input');
            const total = this.getTotalPages();
            let page = Number(input?.value) || 1;
            if (page < 1) page = 1;
            if (page > total) page = total;
            if (typeof this._config.onClick === 'function') {
                this._config.onClick({
                    page,
                    event
                });
            }
            this.onLinkClick(event);
        }
    }

    /**
     * Handles the click event on the pager item link.
     * @param {Event} event
     */
    onLinkClick(event) {
        const target = /** @type {HTMLElement} */ (event.target);
        const pagerItem = /** @type {HTMLAnchorElement | null} */ (target?.closest('a') || target);
        if (pagerItem?.tagName !== 'A') return;

        let page = Number(pagerItem?.getAttribute('data-page'));
        const totalPages = this.getTotalPages();
        if (Number(page) > Number(totalPages)) {
            page = totalPages;
        }

        const payload = {
            page,
            node: pagerItem,
            event
        };

        this.signal('change', payload);

        const { onClick } = this._config;
        if (typeof onClick === 'function') {
            event.preventDefault();
            onClick(payload);
        }
    }

    focusInput() {
        /** @type {HTMLElement | null | undefined} */
        const focusable = this?.querySelector('input[type="number"]');
        typeof focusable?.focus === 'function' && focusable?.focus();
    }

    // #endregion EVENTS
}

defineCustomElement('arpa-pager', Pager);

export default Pager;
