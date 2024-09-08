/**
 * @typedef {import('../../pager').default} Pager
 */
import { mergeObjects, editURL, renderNode, sanitizeURL, attrString } from '@arpadroid/tools';
import ArpaElement from '../../../arpaElement/arpaElement';

const html = String.raw;
class PagerItem extends ArpaElement {
    getDefaultConfig() {
        /** @type {Pager} */
        this.pagerComponent = this.closest('arpa-pager');
        return mergeObjects(super.getDefaultConfig(), {
            className: 'pagerItem',
            isActive: false,
            hasInput: true,
            urlParam: this.pagerComponent?.getUrlParam(),
            ariaLabel: undefined
        });
    }

    _initializeProperties() {
        super._initializeProperties();
        if (!this._config.content && this._config.page) {
            this._config.content = this._config.page;
        }
    }

    render(reRender = false) {
        super.render();
        if (this.isActive()) {
            this.classList.add('pagerItem--active');
        }
        if (!this.contentNode || reRender) {
            this.innerHTML = '';
            this.contentNode = this.renderContent();
            this.appendChild(this.contentNode);
            if (!this.isActive()) {
                this.contentNode.append(...this._childNodes);
            }
        }
    }

    renderInput() {
        this.form = renderNode(
            html`<form class="pagerItem__form">
                <input
                    class="pagerItem__input"
                    aria-label="Current page"
                    type="number"
                    name="${this._config.urlParam}"
                    value="${this.getPage()}"
                    placeholder="${this.getPage()}"
                    min="1"
                    max="${this.pagerComponent.getTotalPages()}"
                />
            </form>`
        );

        this.input = this.form.querySelector('input');
        this.form.addEventListener('submit', event => {
            event.preventDefault();
            const page = this.input.value;
            if (typeof this._config.onClick === 'function') {
                this._config.onClick(page);
            }
            const pagerOnClick = this.pagerComponent?._config?.onClick;
            if (typeof pagerOnClick === 'function') {
                pagerOnClick({ page, event, node: this });
            }
        });
        return this.form;
    }

    renderContent() {
        
        if (this.isActive()) {
            if (this.hasInput()) {
                return this.renderInput();
            }
            return renderNode(html`<span class="pagerItem__content">${this.getPage()}</span>`);
        }
        const page = this.getPage();
        if (page) {
            const ariaLabel = this.getProperty('aria-label');
            this.removeAttribute('aria-label');
            const attr = {
                'data-page': page,
                href: this.getLink(),
                class: 'pagerItem__content',
                ariaLabel
            };
            const linkNode = renderNode(html`<a ${attrString(attr)}></a>`);
            linkNode.addEventListener('click', this._onClick.bind(this));
            return linkNode;
        }
        return renderNode(html`<span class="pagerItem__content"></span>`);
    }

    getLink() {
        const urlParam = this.pagerComponent?.getUrlParam();
        return editURL(sanitizeURL(window.location.href), {
            [urlParam]: this.getPage()
        });
    }

    getPage() {
        return Number(this.getProperty('page'));
    }

    _onClick(event) {
        event.preventDefault();
        const page = event.target.getAttribute('data-page');
        if (typeof this._config.onClick === 'function') {
            this._config.onClick(page);
        }
    }

    isActive() {
        return this.hasProperty('is-active');
    }

    hasInput() {
        return (
            this.pagerComponent?.hasProperty('has-input') ??
            (this.hasProperty('has-input') &&
                !this.classList.contains('pager__next') &&
                !this.classList.contains('pager__prev'))
        );
    }
}

customElements.define('pager-item', PagerItem);

export default PagerItem;
