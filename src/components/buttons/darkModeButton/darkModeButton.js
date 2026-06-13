/**
 * @typedef {import('./darkModeButton.types').DarkModeButtonConfigType} DarkModeButtonConfigType
 */
import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
import IconButton from '../iconButton/iconButton.js';
class DarkModeButton extends IconButton {
    /** @type {DarkModeButtonConfigType} */
    _config = this._config;

    $initialize() {
        super.$initialize();
        this.bind('_onClick');
    }

    /**
     * Returns the default configuration.
     * @returns {DarkModeButtonConfigType}
     */
    getDefaultConfig() {
        this.i18nKey = 'ui.darkModeButton';
        /** @type {DarkModeButtonConfigType} */
        const config = {
            icon: 'dark_mode',
            iconLight: 'light_mode',
            labelText: '{i18n:lblDarkMode}',
            label: '{i18n:lblDarkMode}',
            tooltip: '{i18n:lblDarkMode}',
            labelLight: '{i18n:lblLightMode}',
            nodesConfig: {
                content: { canRender: false }
            }
        };
        return mergeObjects(super.getDefaultConfig(), config);
    }

    /**
     * Toggles Dark Mode styles and updates the icon and label when the button is clicked.
     */
    _onClick() {
        super._onClick();
        const styleNode = document.getElementById('dark-styles');
        if (!(styleNode instanceof HTMLLinkElement)) {
            console.error('Dark mode styles not found.');
            return;
        }
        if (styleNode.disabled) {
            styleNode.removeAttribute('disabled');
            this.setProp('icon', this.getProp('iconLight'));
            this.setProp('tooltip', this.getProp('labelLight'));
        } else {
            styleNode.disabled = true;
            this.setProp('icon', this.getProp('icon'));
            this.setProp('tooltip', this.getProp('label').toString());
        }
    }
}

defineCustomElement('dark-mode-button', DarkModeButton);

export default DarkModeButton;
