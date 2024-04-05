import Message from '../message/message.js';
import { mergeObjects } from '@arpadroid/tools';

class SuccessMessage extends Message {
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            icon: 'check_circle'
        });
    }
}

customElements.define('success-message', SuccessMessage);

export default SuccessMessage;
