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
        this.truncateText = this.truncateText.bind(this);
        this.toggleTruncate = this.toggleTruncate.bind(this);
        this.renderButton();
        await this.promise;
        this._observeContents();
    }

    // #endregion

    /////////////////////
    // #region LIFECYCLE
    /////////////////////

    _observeContents() {
        let nodeCount = this.childNodes.length;
        const observer = new MutationObserver(() => {
            if (this.childNodes.length > nodeCount) {
                nodeCount = this.childNodes.length;
                if (!this.isTruncated) {
                    this._childNodes = [...this.childNodes];
                    this._content = this.innerHTML;
                    this.truncateText();
                }
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
            this.hasProperty('has-button') && this.getProperty('has-button') !== 'false'
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
        const threshold = this.getProperty('threshold');
        const ellipsis = this.getProperty('ellipsis');
        if (text.length > maxLength + threshold) {
            this.isTruncated = true;
            this.innerHTML = html`<span>${text.slice(0, maxLength)}</span>${ellipsis}</span></span>`;
            this.renderButton();
            if (this.button) {
                this.append(this.button);
            }
        }
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
