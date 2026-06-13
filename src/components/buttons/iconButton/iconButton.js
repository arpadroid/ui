/**
 * @typedef {import('./iconButton.types').IconButtonConfigType} IconButtonConfigType
 */
import { mergeObjects } from '@arpadroid/tools';
import { defineCustomElement } from '@arpadroid/tools';
import Button from '../button/button.js';

class IconButton extends Button {
    /** 
     * Returns the default configuration.
     * @returns {IconButtonConfigType}
     */
    getDefaultConfig() {
        /** @type {IconButtonConfigType} */
        const config = {
            buttonClass: 'iconButton__button',
            className: 'iconButton',
            nodesConfig: {
                content: { canRender: false },
                tooltip: {
                    content: () => {
                        return this.getProp('tooltip') || this.getProp('label') || '{label}';
                    }
                }
            }
        };
        return mergeObjects(super.getDefaultConfig(), config);
    }
}

defineCustomElement('icon-button', IconButton);

export default IconButton;
