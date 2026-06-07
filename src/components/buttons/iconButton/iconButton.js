/**
 * @typedef {import('./iconButton.types').IconButtonConfigType} IconButtonConfigType
 */
import { mergeObjects } from '@arpadroid/tools';
import { defineCustomElement } from '@arpadroid/tools';
import Button from '../button/button.js';

class IconButton extends Button {
    getDefaultConfig() {
        const config = {
            buttonClass: 'iconButton__button',
            className: 'iconButton',
            templateChildren: {
                content: { canRender: false },
                tooltip: {
                    content: this.getProp('label')
                }
            }
        };
        return mergeObjects(super.getDefaultConfig(), config);
    }
}

defineCustomElement('icon-button', IconButton);

export default IconButton;
