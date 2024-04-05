import Message from '../message/message.js';
import { mergeObjects } from '@arpadroid/tools';

class InfoMessage extends Message {
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            icon: 'info'
        });
    }
}

customElements.define('info-message', InfoMessage);

export default InfoMessage;
