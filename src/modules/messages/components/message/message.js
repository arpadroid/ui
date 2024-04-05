import { mergeObjects, render } from '@arpadroid/tools';
/**
 * @typedef {import('./messageInterface.js').MessageInterface} MessageInterface
 * @typedef {import('@arpadroid/application/src/index.js').MessageResource} MessageResource
 */

import ListItem from '../../../list/components/listItem/listItem.js';

const html = String.raw;
class Message extends ListItem {
    /**
     * Returns the default config.
     * @returns {MessageInterface}
     */
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            closeLabel: 'Close',
            canClose: false,
            timeout: 0,
            truncateContent: 190
        });
    }

    _initialize() {
        this._onClose = this._onClose.bind(this);
        super._initialize();
    }

    renderRhs() {
        return super.renderRhs(this.renderCloseButton());
    }

    canClose() {
        return this.hasAttribute('can-close') || this._config.canClose;
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

    _onConnected() {
        this.classList.add('message');
        super._onConnected();
        this._initializeMessage();
        this.handleTimeout();
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

    getTimeout() {
        return parseFloat(this.getProperty('timeout'));
    }

    disconnectedCallback() {
        clearTimeout(this.timeout);
    }

    _initializeProperties() {
        this.messagesComponent = this.closest('arpa-messages');
        /** @type {MessageResource} */
        this.resource = this._config.resource ?? this.messagesComponent?.resource;
    }

    _initializeNodes() {
        super._initializeNodes();
        this.closeButton = this.querySelector('.message__closeButton');
        this.closeButton?.removeEventListener('click', this._onClose);
        this.closeButton?.addEventListener('click', this._onClose);
    }

    _onClose() {
        const { onClose } = this._config;
        if (typeof onClose === 'function') {
            onClose();
        }
        this.close();
    }

    close() {
        if (this.resource) {
            this.resource.deleteMessage(this._config);
        } else {
            this.remove();
        }
    }
}

customElements.define('arpa-message', Message);

export default Message;
