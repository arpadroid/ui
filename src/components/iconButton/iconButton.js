/* eslint-disable sonarjs/no-duplicate-string */
/**
 * @typedef {import('../tooltip/tooltip').default} Tooltip
 * @typedef {import('./iconButton.types').IconButtonConfigType} IconButtonConfigType
 */
import { mergeObjects } from '@arpadroid/tools';
import { defineCustomElement } from '@arpadroid/tools';
import Button from '../button/button.js';

class IconButton extends Button {
    getDefaultConfig() {
        const config = {
            buttonClass: 'iconButton'
        };
        return mergeObjects(super.getDefaultConfig(), config);
    }

    renderContent() {
        return '';
    }
}

defineCustomElement('icon-button', IconButton);

export default IconButton;
