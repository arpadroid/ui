/**
 * @typedef {import('../../pager').default} Pager
 * @typedef {import('./pagerItem.types').PagerItemConfigType} PagerItemConfigType
 */
import { mergeObjects, editURL, renderNode, sanitizeURL } from '@arpadroid/tools';
import { attrString, defineCustomElement } from '@arpadroid/tools';
import ArpaElement from '../../../arpaElement/arpaElement';

const html = String.raw;
class PagerItem extends ArpaElement {
    /**
     * Returns the default configuration.
     * @returns {PagerItemConfigType}
     */
    getDefaultConfig() {
        this.bind('_onSubmitInput', '_onClick');
        this.grabPagerComponent();
        return mergeObjects(super.getDefaultConfig(), {
            className: 'pagerItem',
            isActive: false,
            hasInput: true,
            urlParam: 'page',
            ariaLabel: undefined
        });
    }

    _initializeProperties() {
        super._initializeProperties();
        // if (!this._config.content && this._config.page) {
        //     this._config.content = this._config.page;
        // }
    }

    /**
     * Gets the URL parameter name.
     * @returns {string}
     */
    getUrlParam() {
        return this.pagerComponent?.getUrlParam() || this.getProperty('url-param');
    }

    render(reRender = false) {
        this.grabPagerComponent();
        super.render();
        if (this.isActive()) {
            this.classList.add('pagerItem--active');
        }
        if (!this.contentNode || reRender) {
            this.innerHTML = '';
            this.contentNode = this.renderContent();
            if (this.contentNode instanceof HTMLElement) {
                this.appendChild(this.contentNode);
                if (!this.isActive()) {
                    this.contentNode.append(...this.getChildElements());
                }
            }
        }
    }

    /**
     * Grabs the pager component.
     * @returns {Pager | null}
     */
    grabPagerComponent() {
        if (!this.pagerComponent) {
            /** @type {Pager | null} */
            this.pagerComponent = this.closest('arpa-pager');
        }
        return this.pagerComponent;
    }

    renderInput() {
        this.form = renderNode(
            html`<form class="pagerItem__form">
                <input
                    class="pagerItem__input"
                    aria-label="Current page"
                    type="number"
                    name="${this.getUrlParam()}"
                    value="${this.getPage()}"
                    placeholder="${this.getPage()}"
                    min="1"
                    max="${this.pagerComponent?.getTotalPages()}"
                />
            </form>`
        );

        this.form instanceof HTMLElement && (this.input = this.form?.querySelector('input'));
        this.form?.addEventListener('submit', this._onSubmitInput);
        return this.form;
    }

    /**
     * Handles the submit event.
     * @param {Event} event - The event object.
     */
    _onSubmitInput(event) {
        event.preventDefault();
        const page = this.input?.value;
        if (typeof this._config.onClick === 'function') {
            this._config.onClick(page);
        }
        const pagerOnClick = this.pagerComponent?._config?.onClick;
        if (typeof pagerOnClick === 'function') {
            pagerOnClick({ page, event, node: this });
        }
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
            linkNode?.addEventListener('click', this._onClick);
            return linkNode;
        }
        return renderNode(html`<span class="pagerItem__content"></span>`);
    }

    getLink() {
        const urlParam = this.pagerComponent?.getUrlParam();
        return editURL(sanitizeURL(window.location.href), {
            [urlParam || 'page']: this.getPage()
        });
    }

    getPage() {
        return Number(this.getProperty('page'));
    }

    /**
     * Handles the click event.
     * @param {Event} event - The event object.
     */
    _onClick(event) {
        event.preventDefault();
        /** @type {EventTarget | null} */
        const target = event?.target;
        const page = target instanceof HTMLElement && target?.getAttribute('data-page');
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

defineCustomElement('pager-item', PagerItem);

export default PagerItem;
