import IconButton from '../iconButton/iconButton';

class DarkModeButton extends IconButton {
    getDefaultConfig() {
        this._onClick = this._onClick.bind(this);
        return {
            className: 'darkModeButton',
            icon: 'dark_mode',
            iconLight: 'light_mode',
            label: 'Dark mode',
            labelLight: 'Light mode'
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
        if (!(styleNode instanceof HTMLStyleElement)) return;
        if (styleNode.disabled) {
            styleNode.removeAttribute('disabled');
            this.setIcon(this.getIconLight());
            this.setLabel(this.getLabelLight());
        } else {
            styleNode.disabled = true;
            this.setIcon(this.getIcon());
            this.setLabel(this.getLabel());
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

customElements.define('dark-mode-button', DarkModeButton, { extends: 'button' });

export default DarkModeButton;
