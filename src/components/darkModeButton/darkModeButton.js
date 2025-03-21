import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
import IconButton from '../iconButton/iconButton.js';
class DarkModeButton extends IconButton {
    _initialize() {
        super._initialize();
        this.bind('_onClick');
    }

    getDefaultConfig() {
        this.i18nKey = 'gallery.controls.darkMode';
        const config = {
            icon: 'dark_mode',
            iconLight: 'light_mode',
            label: this.i18n('lblDarkMode'),
            labelText: this.i18nText('lblDarkMode'),
            labelLight: this.i18n('lblLightMode')
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
            this.setIcon(this.getIconLight());
            this.setTooltip(this.getLabelLight());
        } else {
            styleNode.disabled = true;
            this.setIcon(this.getIcon());
            this.setTooltip(this.getLabel().toString());
        }
    }

    /**
     * Returns the label for light mode.
     * @returns {string}
     */
    getLabelLight() {
        return this.getProperty('label-light');
    }

    /**
     * Returns the icon for light mode.
     * @returns {string}
     */
    getIconLight() {
        return this.getProperty('icon-light');
    }
}

defineCustomElement('dark-mode-button', DarkModeButton);

export default DarkModeButton;
