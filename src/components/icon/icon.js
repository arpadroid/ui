class Icon extends HTMLElement {
    connectedCallback() {
        this.classList.add('material-symbols-outlined', 'icon');
        if (this.innerHTML === '') {
            this.remove();
        }
    }
}

customElements.define('arpa-icon', Icon );

export default Icon;
