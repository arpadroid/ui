/**
 * @typedef {import('./messageInterface.js').MessageInterface} MessageInterface
 * @typedef {import('@arpadroid/application/src/index.js').MessageResource} MessageResource
 */
import { mergeObjects, render } from '@arpadroid/tools';
import ListItem from '../../../list/components/listItem/listItem.js';
const html = String.raw;
class Message extends ListItem {
    /////////////////////////
    // #region INITIALIZATION
    /////////////////////////
    /**
     * Returns the default config.
     * @returns {MessageInterface}
     */
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            closeLabel: 'Close',
            canClose: false,
            icon: 'chat_bubble',
            timeout: 0,
            truncateContent: 190
        });
    }

    _initialize() {
        this._onClose = this._onClose.bind(this);
        super._initialize();
    }

    _initializeProperties() {
        this.messagesComponent = this.closest('arpa-messages');
        /** @type {MessageResource} */
        this.resource = this._config.resource ?? this.messagesComponent?.resource;
    }

    // #endregion

    ////////////////////
    // #region ACCESSORS
    ////////////////////

    canClose() {
        return this.hasAttribute('can-close') || this._config.canClose;
    }

    close() {
        if (this.resource) {
            this.resource.deleteMessage(this._config);
        } else {
            this.remove();
        }
    }

    getTimeout() {
        return parseFloat(this.getProperty('timeout'));
    }

    getContent() {
        return (super.getContent() ?? this.getProperty('text')) || this.getProperty('i18n');
    }

    // #endregion

    ////////////////////
    // #region RENDERING
    ////////////////////

    renderRhs() {
        return super.renderRhs(this.renderCloseButton());
    }

    renderCloseButton() {
        const label = this.getProperty('close-label');
        return render(
            this.canClose(),
            html`<button
                is="icon-button"
                class="message__closeButton"
                icon="close"
                variant="minimal"
                label="${label}"
            ></button>`
        );
    }

    // #endregion

    /////////////////////
    // #region LIFECYCLE
    /////////////////////

    _onConnected() {
        this.classList.add('message');
        super._onConnected();
        this._initializeMessage();
        this.handleTimeout();
    }

    _initializeNodes() {
        super._initializeNodes();
        this.closeButton = this.querySelector('.message__closeButton');
        this.closeButton?.removeEventListener('click', this._onClose);
        this.closeButton?.addEventListener('click', this._onClose);
    }

    _initializeMessage() {
        const message = this.resource?.registerMessage(this._config, this);
        if (message) {
            this._config.id = message.id;
            this._config.node = message.node;
        }
    }

    handleTimeout() {
        const timeout = this.getTimeout();
        if (timeout) {
            this.timeout = setTimeout(() => this.close(), timeout * 1000);
        }
    }

    disconnectedCallback() {
        clearTimeout(this.timeout);
    }

    // #endregion

    _onClose() {
        const { onClose } = this._config;
        if (typeof onClose === 'function') {
            onClose();
        }
        this.close();
    }
}

customElements.define('arpa-message', Message);

export default Message;
