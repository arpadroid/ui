import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
import IconButton from '../iconButton/iconButton.js';
class DarkModeButton extends IconButton {
    $initialize() {
        super.$initialize();
        this.bind('_onClick');
    }

    getDefaultConfig() {
        this.i18nKey = 'ui.darkModeButton';
        const config = {
            icon: 'dark_mode',
            iconLight: 'light_mode',
            labelText: this.i18nText('lblDarkMode'),
            label: this.i18n('lblDarkMode'),
            tooltip: this.i18nText('lblDarkMode'),
            labelLight: this.i18n('lblLightMode'),
            templateChildren: {
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
            this.setIcon(this.getIconLight());
            this.setTooltip(this.getLabelLight());
        } else {
            styleNode.disabled = true;
            this.setIcon(this.getProp('icon'));
            this.setTooltip(this.getProp('label').toString());
        }
    }

    /**
     * Returns the label for light mode.
     * @returns {string}
     */
    getLabelLight() {
        return this.getProp('label-light');
    }

    /**
     * Returns the icon for light mode.
     * @returns {string}
     */
    getIconLight() {
        return this.getProp('icon-light');
    }
}

defineCustomElement('dark-mode-button', DarkModeButton);

export default DarkModeButton;
