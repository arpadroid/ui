import { defineCustomElement, mechanize } from '@arpadroid/tools';

class Icon extends HTMLElement {
    /** @type {string} */
    icon;
    constructor() {
        super();
        this.classList.add('material-symbols-outlined', 'icon');
    }

    connectedCallback() {
        if (['', 'none'].includes(this.innerHTML)) {
            this.remove();
        }
        const iconClass = 'icon--' + mechanize(this.innerHTML);
        this.classList.add(iconClass);
    }
    /**
     * Sets the icon to display.
     * @param {string} icon
     */
    setIcon(icon) {
        this.icon = icon;
        this.innerHTML = icon;
    }

    getIcon() {
        return this.icon || this.innerHTML.trim();
    }
}

defineCustomElement('arpa-icon', Icon);

export default Icon;
