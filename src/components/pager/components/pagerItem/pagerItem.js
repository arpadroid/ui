/**
 * @typedef {import('../../pager').default} Pager
 * @typedef {import('./pagerItem.types').PagerItemConfigType} PagerItemConfigType
 */
import { mergeObjects, editURL, renderNode, sanitizeURL } from '@arpadroid/tools';
import { attrString, defineCustomElement } from '@arpadroid/tools';
import ArpaElement from '../../../arpaElement/arpaElement';

const html = String.raw;
class PagerItem extends ArpaElement {
    ///////////////////////////////
    // #region Initialization
    ///////////////////////////////

    /**
     * Returns the default configuration.
     * @returns {PagerItemConfigType}
     */
    getDefaultConfig() {
        this.bind('_onSubmitInput', '_onClick');
        this.grabPagerComponent();
        /** @type {PagerItemConfigType} */
        const config = {
            className: 'pagerItem',
            isActive: false,
            hasInput: true,
            urlParam: 'page',
            ariaLabel: undefined
        };
        return mergeObjects(super.getDefaultConfig(), config);
    }

    // #endregion Initialization

    ///////////////////////////////
    // #region Get
    ///////////////////////////////

    getPage() {
        return Number(this.getProperty('page'));
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

    getLink() {
        const urlParam = this.pagerComponent?.getUrlParam();
        return editURL(sanitizeURL(window.location.href), {
            [urlParam || 'page']: this.getPage()
        });
    }

    /**
     * Gets the URL parameter name.
     * @returns {string}
     */
    getUrlParam() {
        return this.pagerComponent?.getUrlParam() || this.getProperty('url-param');
    }

    isActive() {
        return this.pagerComponent?.getCurrentPage() == this.getPage() || this.hasProperty('is-active');
    }

    hasInput() {
        return (
            this.pagerComponent?.hasProperty('has-input') ??
            (this.hasProperty('has-input') &&
                !this.classList.contains('pager__next') &&
                !this.classList.contains('pager__prev'))
        );
    }

    // #endregion Get

    ///////////////////////////////
    // #region Render
    ///////////////////////////////

    /**
     * Renders the pager item.
     * @param {string | undefined} template - The template to render.
     * @param {boolean} reRender - Whether to re-render the item.
     */
    render(template, reRender = false) {
        this.grabPagerComponent();
        super.render(template);
        if (!this.contentNode || reRender) {
            this.innerHTML = '';
            this.contentNode = this.renderContent();
            this.contentNode && this.appendChild(this.contentNode);
            this.appendChildren();
        }
    }

    renderInput() {
        this.form = renderNode(
            html`<arpa-form
                id="pager-item-input--${this.pagerComponent?.getId()}"
                class="pagerItem__form"
                variant="mini"
            >
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
            </arpa-form>`
        );

        this.form instanceof HTMLElement && (this.input = this.form?.querySelector('input'));
        this.form?.addEventListener('submit', this._onSubmitInput);
        return this.form;
    }

    renderContent() {
        if (this.isActive()) {
            if (this.hasInput()) return this.renderInput();
            return this.renderSelected();
        }
        const page = this.getPage();
        if (page) return this.renderPage(page);
        return renderNode(html`<span class="pagerItem__content"></span>`);
    }

    renderSelected() {
        return renderNode(html`<span class="pagerItem__content">${this.getPage()}</span>`);
    }

    /**
     * Renders the page link.
     * @param {number} page - The page number.
     * @returns {HTMLElement | null}
     */
    renderPage(page) {
        const ariaLabel = this.getProperty('aria-label');
        this.removeAttribute('aria-label');

        const linkNode = renderNode(
            html`<a
                ${attrString({
                    'data-page': page,
                    href: this.getLink(),
                    class: 'pagerItem__content',
                    ariaLabel
                })}
            ></a>`
        );
        linkNode?.addEventListener('click', this._onClick);
        return linkNode;
    }

    appendChildren() {
        !this.isActive() && this.contentNode?.append(...this.getChildElements());
    }

    // #endregion Render

    ///////////////////////////////
    // #region Events
    ///////////////////////////////

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

    // #endregion Events
}

defineCustomElement('pager-item', PagerItem);

export default PagerItem;
