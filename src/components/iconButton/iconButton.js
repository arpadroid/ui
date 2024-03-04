
const html = String.raw;
class IconButton extends HTMLButtonElement {

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = html`<arpa-icon>${this.innerHTML}</arpa-icon>`;
    }
}
customElements.define('icon-button', IconButton, { extends: 'button' });
export default IconButton;
