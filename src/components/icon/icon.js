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

    setIcon(icon) {
        this.innerHTML = icon;
    }
}

customElements.define('arpa-icon', Icon);

export default Icon;
