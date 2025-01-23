class Icon extends HTMLElement {
    constructor() {
        super();
        this.classList.add('material-symbols-outlined', 'icon');
    }

    connectedCallback() {
        if (['', 'none'].includes(this.innerHTML)) {
            this.remove();
        }
    }
    /**
     * Sets the icon to display.
     * @param {string} icon - The string defining the icon to display.
     */
    setIcon(icon) {
        this.innerHTML = icon;
    }
}

customElements.define('arpa-icon', Icon);

export default Icon;
