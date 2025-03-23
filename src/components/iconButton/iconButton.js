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

    async _initializeNodes() {
        await super._initializeNodes();
        const childNodes = this._childNodes || [];
        const text = childNodes[0] instanceof Text ? childNodes[0].textContent?.trim() : '';
        text && this.setIcon(text);
        return true;
    }
}

defineCustomElement('icon-button', IconButton);

export default IconButton;
