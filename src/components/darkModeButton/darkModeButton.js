import { defineCustomElement } from '@arpadroid/tools';
import IconButton from '../iconButton/iconButton';
import { I18nTool, I18n } from '@arpadroid/i18n';
const { arpaElementI18n } = I18nTool;
class DarkModeButton extends IconButton {
    getDefaultConfig() {
        this._onClick = this._onClick.bind(this);
        this.i18nKey = 'gallery.controls.darkMode';
        return {
            className: 'darkModeButton',
            icon: 'dark_mode',
            iconLight: 'light_mode',
            label: arpaElementI18n(this, 'lblDarkMode', {}, {}),
            labelText: I18n.getText('lblDarkMode'),
            labelLight: arpaElementI18n(this, 'lblLightMode', {}, {})
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this.removeEventListener('click', this._onClick);
        this.addEventListener('click', this._onClick);
    }

    /**
     * Toggles Dark Mode styles and updates the icon and label when the button is clicked.
     */
    _onClick() {
        const styleNode = document.getElementById('dark-styles');
        if (!(styleNode instanceof HTMLLinkElement)) {
            console.error('Dark mode styles not found.');
            return;
        }
        if (styleNode.disabled) {
            styleNode.removeAttribute('disabled');
            this.setIcon(this.getIconLight());
            this.setLabel(this.getLabelLight());
        } else {
            styleNode.disabled = true;
            this.setIcon(this.getIcon());
            this.setLabel(this.getLabel().toString());
        }
    }

    /**
     * Returns the label for light mode.
     * @returns {string}
     */
    getLabelLight() {
        return this.getAttribute('label-light') || this._config.labelLight;
    }

    /**
     * Returns the icon for light mode.
     * @returns {string}
     */
    getIconLight() {
        return this.getAttribute('icon-light') || this._config.iconLight;
    }
}

defineCustomElement('dark-mode-button', DarkModeButton, { extends: 'button' });

export default DarkModeButton;
