import Message from '../message/message.js';
import { mergeObjects } from '@arpadroid/tools';

class ErrorMessage extends Message {
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            icon: 'report'
        });
    }
}

customElements.define('error-message', ErrorMessage);

export default ErrorMessage;
