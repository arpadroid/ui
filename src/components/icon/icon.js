import { defineCustomElement, mechanize } from '@arpadroid/tools';

class Icon extends HTMLElement {
    constructor() {
        super();
        this.classList.add('material-symbols-outlined', 'icon');
    }

    connectedCallback() {
        if (['', 'none'].includes(this.innerHTML)) {
            this.remove();
        }
        const iconClass = 'icon--' +  mechanize(this.innerHTML);
        this.classList.add(iconClass);
    }
    /**
     * Sets the icon to display.
     * @param {string} icon - The string defining the icon to display.
     */
    setIcon(icon) {
        this.innerHTML = icon;
    }
}

defineCustomElement('arpa-icon', Icon);

export default Icon;
