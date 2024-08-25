/* eslint-disable sonarjs/no-duplicate-string */
import ArpaElement from '../arpaElement/arpaElement.js';
/**
 * @typedef {import('./truncateTextInterface').TruncateTextInterface } TruncateTextInterface
 */
const html = String.raw;
class TruncateText extends ArpaElement {
    /////////////////////////
    // #region INITIALIZATION
    /////////////////////////
    /**
     * Returns the default component config.
     * @returns {TruncateTextInterface}
     */
    getDefaultConfig() {
        return {
            maxLength: 50,
            threshold: 20,
            ellipsis: html`<span class="truncateText__ellipsis">...</span> `,
            readMoreLabel: 'Read more',
            readLessLabel: 'Read less',
            buttonClasses: ['truncateText__readMoreButton', 'button--link'],
            hasButton: false
        };
    }

    async _initialize() {
        this.fullContent = this.textContent.trim();
        this.truncateText = this.truncateText.bind(this);
        this.toggleTruncate = this.toggleTruncate.bind(this);
        await this.load;
        this.renderButton();
        this._observeContents();
    }

    // #endregion

    /////////////////////
    // #region LIFECYCLE
    /////////////////////

    _observeContents() {
        const observer = new MutationObserver(() => {
            const textNode = this.querySelector('.truncateText__content');
            const content = this.textContent.trim();
            if (!textNode && content !== this.fullContent) {
                this._childNodes = [...this.childNodes];
                this._content = this.innerHTML;
                this.fullContent = this.textContent.trim();
            }
        });
        observer.observe(this, { childList: true });
    }

    _onConnected() {
        if (this.innerHTML.trim().length) {
            this.truncateText();
        }
    }

    // #endregion

    ////////////////////
    // #region ACCESSORS
    ////////////////////

    getMaxLength() {
        return parseFloat(this.getProperty('max-length'));
    }

    getThreshold() {
        return parseFloat(this.getProperty('threshold'));
    }

    hasButton() {
        return (
            this.hasProperty('has-button') &&
            this.getProperty('has-button') !== 'false' &&
            this.shouldTruncate()
        );
    }

    getButtonLabel() {
        return this.isTruncated ? this.getProperty('read-more-label') : this.getProperty('read-less-label');
    }

    truncateText() {
        const maxLength = this.getMaxLength();
        if (!maxLength) {
            return;
        }
        const text = this.textContent;
        const ellipsis = this.getProperty('ellipsis');
        if (this.shouldTruncate()) {
            this.isTruncated = true;
            this.innerHTML = html`
                <span class="truncateText__content"> ${text.slice(0, maxLength)} </span>
                <span class="truncateText__ellipsis"> ${ellipsis} </span>
            `;
            this.textNode = this.querySelector('.truncateText__content');
            this.renderButton();
        }
    }

    shouldTruncate() {
        return this.fullContent.length > this.getMaxLength() + this.getThreshold();
    }

    showFullContent() {
        if (this.isTruncated) {
            this.innerHTML = '';
            this.isTruncated = false;
            this.renderButton();
            this.append(...this._childNodes, this.button);
        }
    }

    toggleTruncate() {
        if (this.isTruncated) {
            this.showFullContent();
        } else {
            this.truncateText();
        }
    }

    // #endregion

    ////////////////////
    // #region RENDERING
    ////////////////////

    renderButton() {
        if (this.hasButton()) {
            if (!this.button) {
                const button = document.createElement('button');
                button.type = 'button';
                button.classList.add(...this.getButtonClasses());
                button.addEventListener('click', this.toggleTruncate);
                this.button = button;
            }
            this.button.textContent = this.getButtonLabel();
            this.button.setAttribute('aria-expanded', !this.isTruncated);
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
    // #endregion
}

customElements.define('truncate-text', TruncateText);

export default TruncateText;
