import { getAttributes, attrString } from '@arpadroid/tools';

class ArpaFragment extends HTMLElement {
    constructor() {
        super();
        this._childNodes = [...this.childNodes];
    }

    getAttributes() {
        return attrString(getAttributes(this));
    }

    connectedCallback() {
        while (this.firstChild) {
            this.parentNode?.insertBefore(this.firstChild, this);
        }
        this.parentNode?.removeChild(this);
    }
}

customElements.define('arpa-fragment', ArpaFragment);

export default ArpaFragment;
