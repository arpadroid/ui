import { getURLParam, attrString, renderNode, editURL } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement.js';

const html = String.raw;
class Pager extends ArpaElement {
    //////////////////////////
    // #region INITIALIZATION
    /////////////////////////

    pagerItems = {};
    _initialize() {
        super._initialize();
        this.onHandlerClick = this.onHandlerClick.bind(this);
    }

    getDefaultConfig() {
        return {
            title: 'Pager',
            className: 'pager',
            currentPage: 1,
            totalPages: 1,
            maxNodes: 7,
            hasArrowControls: true,
            urlParam: 'page'
        };
    }

    initializeProperties() {
        this.list = this.closest('.arpaList');
        this.resource = this.list?.listResource;
        this.resource?.listen('ITEMS', () => {
            this._config.totalPages = this.resource.getTotalPages();
            Object.assign(this._config, {
                currentPage: this.getCurrentPage(),
                totalPages: this.resource.getTotalPages()
            });
            this.renderPager();
        });
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

    setCurrentPage(page) {
        this._config.currentPage = page;
        this.setAttribute('current-page', page);
    }

    onChange(onClick) {
        this._config.onClick = onClick;
    }

    getCurrentPage() {
        if (this.resource) {
            console.log('getting current page from resource');
            return this.resource?.getCurrentPage();
        }
        const urlParam = this.getUrlParam();
        const currentPage = this.getProperty('current-page');
        return parseFloat(getURLParam(urlParam) ?? currentPage);
    }

    getUrlParam() {
        return this.getProperty('url-param') ?? 'page';
    }

    getTotalPages() {
        return this.resource?.getTotalPages() ?? this.getProperty('total-pages');
    }

    setTotalPages(totalPages) {
        this._config.totalPages = totalPages;
        this.setAttribute('total-pages', totalPages);
    }

    hasArrowControls() {
        return this.hasProperty('has-arrow-controls');
    }

    getMaxNodes() {
        return parseFloat(this.getProperty('max-nodes'));
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

    // #endregion ACCESSORS

    /////////////////////
    // #region RENDERING
    /////////////////////

    render() {
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

    addNodes(start, end, totalPages, hasLeftSpacer, hasRightSpacer) {
        this.innerHTML = '';
        this.addPrev(this);
        this.numbersNode = document.createElement('div');
        this.numbersNode.classList.add('pager__numbers');
        this.appendChild(this.numbersNode);
        this.renderItem(1, { onUpdate: ({ node }) => this.updateNumberItem(node) });
        hasLeftSpacer && this.addSpacer('pagerItem-spacer-left');
        this.addMain(start, end);
        hasRightSpacer && this.addSpacer('pagerItem-spacer-right');
        this.renderItem(totalPages, { onUpdate: ({ node }) => this.updateNumberItem(node) });
        this.addNext(this);
    }

    async renderItem(page, config = {}) {
        const {
            id = `pagerItem-${page}`,
            content = page.toString(),
            isActive = this.getCurrentPage() === Number(page),
            container = this.numbersNode,
            onUpdate,
            className
        } = config;
        const isCurrent = this.getCurrentPage() === Number(page);
        let item = this.pagerItems[id];
        if (!item) {
            const attr = { page, 'is-active': isActive, class: className };
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

    addSpacer(id = 'pagerItem-spacer') {
        this.renderItem(undefined, {
            id,
            content: '...',
            container: this.numbersNode,
            className: 'pager__spacer'
        });
    }

    addMain(start, end) {
        for (let i = start; i <= end; i++) {
            this.renderItem(i, {
                container: this.numbersNode,
                onUpdate: ({ node }) => this.updateNumberItem(node)
            });
        }
    }

    updateNumberItem(node) {
        if (Number(node.getAttribute('page')) === this.getCurrentPage()) {
            node.setAttribute('is-active', '');
            node.render(true);
        } else if (node.hasAttribute('is-active')) {
            node.removeAttribute('is-active');
            node.render(true);
        }
    }

    // #region ARROW CONTROLS

    updateArrowControl(node, page) {
        node.setAttribute('page', page);
        const link = node.querySelector('a');
        link.href = editURL(link.href, { [this.getUrlParam()]: page });
        link.setAttribute('data-page', page);
    }

    addPrev(frag = this) {
        this.hasArrowControls() &&
            this.renderItem(this.getPrevPage(), {
                content: html`<arpa-icon>chevron_left</arpa-icon>`,
                container: frag,
                id: 'pagerItem-prev',
                className: 'pager__prev',
                onUpdate: ({ node }) => this.updateArrowControl(node, this.getPrevPage())
            });
    }

    addNext(frag = this) {
        this.hasArrowControls() &&
            this.renderItem(this.getNextPage(), {
                content: html`<arpa-icon>chevron_right</arpa-icon>`,
                container: frag,
                id: 'pagerItem-next',
                className: 'pager__next',
                onUpdate: ({ node }) => this.updateArrowControl(node, this.getNextPage())
            });
    }

    // #endregion ARROW CONTROLS

    // #endregion RENDERING

    // #region EVENT HANDLERS

    onHandlerClick(event) {
        const { onClick } = this._config;
        const pagerItem = event.target.closest('pager-item');
        onClick({ page: Number(pagerItem.getAttribute('page')), node: pagerItem, event });
        requestAnimationFrame(() => pagerItem.querySelector('a, button')?.focus());
    }

    async _handleClick(node) {
        await this.promise;
        const clickHandlers = node.querySelectorAll('a.pagerItem__content, button.pagerItem__content');
        clickHandlers.forEach(handler => handler.addEventListener('click', this.onHandlerClick));
    }

    // #endregion EVENT HANDLERS
}

customElements.define('arpa-pager', Pager);

export default Pager;
