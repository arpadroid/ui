/**
 * @typedef {import('./messagesInterface.js').MessagesInterface} MessagesInterface
 * @typedef {import('../message/messageInterface').MessageInterface} MessageInterface
 */
import { mergeObjects } from '@arpadroid/tools';
import { MessageResource } from '@arpadroid/application';
import ArpaElement from '../../../../components/arpaElement/arpaElement.js';

class Messages extends ArpaElement {
    messagesById = {};
    messagesByText = {};
    messagesByType = {};

    //////////////////////////
    // #region INITIALIZATION
    /////////////////////////

    _bindMethods() {
        super._bindMethods();
        this.onResourceAddMessage = this.onResourceAddMessage.bind(this);
    }

    /**
     * Returns default config.
     * @returns {MessagesInterface}
     */
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            messages: [],
            resourceConfig: {},
            prependNewMessages: true
        });
    }

    _initialize() {
        const id = this.getProperty('id');
        if (!id) {
            throw new Error('Messages must have an id.');
        }
        this._initializeResource();
    }

    _initializeResource() {
        if (!this.resource) {
            /** @type { MessageResource } */
            this.resource = new MessageResource({ id: this.getProperty('id') });
            this.resource.listen('DELETE_MESSAGE', message => message?.node?.remove());
            this.resource.listen('DELETE_MESSAGES', () => (this.innerHTML = ''));
            this.resource.listen('ADD_MESSAGE', this.onResourceAddMessage);
        }
    }

    // #endregion

    ///////////////////////////
    // #region RESOURCE EVENTS
    //////////////////////////
    onResourceAddMessage(message) {
        const prependNewMessages = this.hasProperty('prepend-new-messages');
        let { type = 'arpa' } = message;
        if (!this.getMessageTypes().includes(type)) {
            type = 'arpa';
        }
        const node = document.createElement(`${type}-message`);
        message.node = node;
        node.setConfig(message);
        prependNewMessages ? this.prepend(node) : this.appendChild(node);
    }
    // #endregion

    ////////////////////
    // #region ACCESSORS
    ////////////////////

    getMessageTypes() {
        return ['arpa', 'info', 'success', 'warning', 'error'];
    }

    /**
     * Adds a message to the messenger.
     * @param {MessageInterface} message
     * @returns {MessageInterface}
     */
    addMessage(message) {
        return this.resource.addMessage(message);
    }

    /**
     * Adds messages to the messenger.
     * @param {MessageInterface[]} messages
     * @returns {Messages}
     */
    addMessages(messages) {
        this.resource.addMessages(messages);
        return this;
    }

    /**
     * Deletes a message from the messenger.
     * @param {MessageInterface} message
     * @returns {Messages}
     */
    deleteMessage(message) {
        this.resource.deleteMessage(message);
        return this;
    }

    deleteMessages() {
        return this.resource.deleteMessages();
    }

    // #endregion
}

customElements.define('arpa-messages', Messages);

export default Messages;
