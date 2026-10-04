/**
 * @typedef {import('./iconButton.types').IconButtonConfigType} IconButtonConfigType
 */
import { mergeObjects } from '@arpadroid/tools';
import { defineCustomElement } from '@arpadroid/tools';
import Button from '../button/button.js';

class IconButton extends Button {
    /**
     * @returns {IconButtonConfigType}
     */
    getDefaultConfig() {
        const parentConfig = super.getDefaultConfig();
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
        return mergeObjects(parentConfig, config);
    }
}

defineCustomElement('icon-button', IconButton);

export default IconButton;
