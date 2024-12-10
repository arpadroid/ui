/* eslint-disable sonarjs/no-duplicate-string */
import ArpaElement from '../arpaElement/arpaElement.js';
import { appendNodes } from '@arpadroid/tools';
/**
 * @typedef {import('./truncateTextInterface').TruncateTextInterface } TruncateTextInterface
 */
const html = String.raw;
class TruncateText extends ArpaElement {
    //////////////////////////////
    // #region INITIALIZATION
    /////////////////////////////
    /**
     * Returns the default component config.
     * @returns {TruncateTextInterface}
     */
    getDefaultConfig() {
        return {
            maxLength: 50,
            threshold: 20,
            ellipsis: '...',
            readMoreLabel: 'read more',
            readLessLabel: 'read less',
            buttonClasses: ['truncateText__readMoreButton', 'button--link'],
            hasButton: false
        };
    }

    async _initialize() {
        this.fullContent = this.textContent.trim();
        this.truncateText = this.truncateText.bind(this);
        this.toggleTruncate = this.toggleTruncate.bind(this);
        this.renderButton();
        this._observeContents();
    }

    ///////////////////////////////
    // #endregion INITIALIZATION
    //////////////////////////////

    ////////////////////////////
    // #region LIFECYCLE
    ////////////////////////////

    _observeContents() {
        const observer = new MutationObserver(() => {
            const textNode = this.querySelector('.truncateText__content');
            const content = this.textContent.trim();
            if (!this.isTruncated && !textNode && content !== this.fullContent) {
                this._childNodes = [...this.childNodes];
                this._nodes = [...this.childNodes];
                this._content = this.innerHTML;
                this.fullContent = this.textContent.trim();
                this.truncateText();
            }
        });
        observer.observe(this, { childList: true });
    }

    _onConnected() {
        this.truncateText();
    }

    //////////////////////////
    // #endregion LIFECYCLE
    //////////////////////////

    //////////////////////////
    // #region ACCESSORS
    /////////////////////////

    getMaxLength() {
        return parseFloat(this.getProperty('max-length'));
    }

    getThreshold() {
        return parseFloat(this.getProperty('threshold'));
    }

    hasButton() {
        return this.hasProperty('has-button') && this.shouldTruncate();
    }

    getButtonLabel() {
        return this.isTruncated ? this.getProperty('read-more-label') : this.getProperty('read-less-label');
    }

    toggleTruncate() {
        this.isTruncated ? this.showFullContent() : this.truncateText();
    }

    // #endregion

    ////////////////////
    // #region RENDERING
    ////////////////////

    renderButton(isTruncated = this.isTruncated) {
        if (this.hasButton()) {
            if (!this.button) {
                const button = document.createElement('button');
                button.type = 'button';
                button.classList.add(...this.getButtonClasses());
                button.addEventListener('click', this.toggleTruncate);
                this.button = button;
            }
            this.button.textContent = this.getButtonLabel();
            this.button.setAttribute('aria-expanded', !isTruncated);
            this.append(this.button);
        } else if (this.button) {
            this.button.remove();
        }
    }

    getButtonClasses() {
        let classes = this.getProperty('button-classes');
        if (typeof classes === 'string') {
            classes = classes.trim().split(' ');
        }
        if (!Array.isArray(classes)) {
            classes = this.getDefaultConfig().buttonClasses;
        }
        return classes;
    }

    truncateText() {
        const maxLength = this.getMaxLength();
        if (!maxLength || !this.innerHTML.trim().length || this.showingFullContent) {
            return;
        }
        const text = this.textContent.trim();
        const ellipsis = this.getProperty('ellipsis');
        if (this.shouldTruncate()) {
            this.isTruncated = true;
            const ellipsisHTML = html`<span class="truncateText__ellipsis">${ellipsis}</span>`;
            const content = text.slice(0, maxLength);
            this.innerHTML = html`<span class="truncateText__content">${content}${ellipsisHTML}</span>`;
            this.textNode = this.querySelector('.truncateText__content');
            this.renderButton();
        }
    }

    shouldTruncate() {
        return this.fullContent.length > this.getMaxLength() + this.getThreshold();
    }

    showFullContent() {
        this.showingFullContent = true;
        this.innerHTML = html`<span class="truncateText__content"></div>`;
        this.textNode = this.querySelector('.truncateText__content');

        this.isTruncated = false;
        appendNodes(this.textNode, this._childNodes);
        this.renderButton(false);
        this.appendChild(this.button);
        setTimeout(() => {
            this.showingFullContent = false;
        }, 100);
    }

    // #endregion
}

customElements.define('truncate-text', TruncateText);

export default TruncateText;
