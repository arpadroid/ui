import Message from '../message/message.js';
import { mergeObjects } from '@arpadroid/tools';

class WarningMessage extends Message {
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            icon: 'warning'
        });
    }
}

customElements.define('warning-message', WarningMessage);

export default WarningMessage;
