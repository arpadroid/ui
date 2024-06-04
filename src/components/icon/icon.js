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
}

customElements.define('arpa-icon', Icon);

export default Icon;
