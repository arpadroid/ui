import { getURLParam, attrString, renderNode } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement.js';

const html = String.raw;
class Pager extends ArpaElement {
    //////////////////////////
    // #region INITIALIZATION
    /////////////////////////

    pagerItems = [];

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
        !this.frag && (this.frag = document.createDocumentFragment());

        this.addPrev(this.frag);
        this.numbersNode = document.createElement('div');
        this.numbersNode.classList.add('pager__numbers');
        this.frag.appendChild(this.numbersNode);
        this.renderItem(1);
        hasLeftSpacer && this.addSpacer();
        this.addMain(start, end);
        hasRightSpacer && this.addSpacer();
        this.renderItem(totalPages);
        this.addNext(this.frag);
        requestAnimationFrame(() => {
            this.innerHTML = '';
            this.appendChild(this.frag);
        });
    }

    renderItem(page, config = {}) {
        const {
            content = page.toString(),
            isActive = this.getCurrentPage() === Number(page),
            container = this.numbersNode,
            className
        } = config;
        const attr = { page, 'is-active': isActive, class: className };
        const itemHTML = html`<pager-item ${attrString(attr)}>${content}</pager-item>`;
        const item = renderNode(itemHTML);
        this._handleClick(item, Number(page));
        container.appendChild(item);
        return item;
    }

    async _handleClick(node, page) {
        await this.promise;
        const { onClick } = this._config;
        const clickHandlers = node.querySelectorAll('a.pagerItem__content, button.pagerItem__content');
        clickHandlers.forEach(handler => {
            handler.addEventListener('click', event => {
                onClick({ page, node, event });
                // event.preventDefault();
            });
            
        });
    }

    addPrev(frag = this) {
        this.hasArrowControls() &&
            this.renderItem(this.getPrevPage(), {
                content: html`<arpa-icon>chevron_left</arpa-icon>`,
                container: frag,
                className: 'pager__prev'
            });
    }

    addNext(frag = this) {
        this.hasArrowControls() &&
            this.renderItem(this.getNextPage(), {
                content: html`<arpa-icon>chevron_right</arpa-icon>`,
                container: frag,
                className: 'pager__next'
            });
    }

    addSpacer() {
        this.numbersNode.append(renderNode(html`<span class="pager__spacer">...</span>`));
    }

    addMain(start, end) {
        for (let i = start; i <= end; i++) {
            this.numbersNode.append(this.renderItem(i));
        }
    }

    // #endregion RENDERING
}

customElements.define('arpa-pager', Pager);

export default Pager;
