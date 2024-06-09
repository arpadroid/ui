/** @typedef {import('./navLinkInterface.js').NavLinkInterface} NavLinkInterface */
import { mergeObjects, attr, sanitizeURL } from '@arpadroid/tools';
import ListItem from '../../../list/components/listItem/listItem.js';
import { Context } from '@arpadroid/application';

class NavLink extends ListItem {
    cleanup;
    // #region INITIALIZATION
    /**
     * Gets the default config for the component.
     * @returns {NavLinkInterface}
     */
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            link: '',
            action: undefined,
            role: '',
            className: 'navLink',
            selected: false,
            handlerAttributes: {}
        });
    }

    _initialize() {
        super._initialize();
        this.cleanup = [Context?.Router?.listen('ROUTE_CHANGED', () => this.updateAriaCurrent())];
    }

    disconnectedCallback() {
        this.cleanup?.forEach(cleanup => typeof cleanup === 'function' && cleanup());
    }

    // #endregion

    // #region LIFECYCLE

    _initializeNodes() {
        super._initializeNodes();
        this.linkNode = this.mainNode;
        attr(this.linkNode, {
            ...(this._config.handlerAttributes ?? {}),
            'aria-current': this.getAriaCurrent()
        });
    }

    // #endregion

    // #region ACCESSORS

    updateAriaCurrent() {
        this.linkNode && attr(this.linkNode, { 'aria-current': this.getAriaCurrent() });
    }

    getTagName() {
        return 'nav-link';
    }

    getAriaCurrent() {
        if (this.isSelected()) {
            return 'location';
        }
        if (this.isSelectedLink()) {
            return 'page';
        }
    }

    isSelected() {
        return this.getProperty('selected');
    }

    isSelectedLink() {
        if (this.link) {
            const path = sanitizeURL(this.link);
            const currentPath = sanitizeURL(window.parent.location.href);
            return path === currentPath;
        }
        return false;
    }

    getDivider() {
        if (this.list) {
            return (
                this.list.getVariant() === 'horizontal' &&
                (this.list._slots.find(slot => slot.name === 'divider') || this.list?.getProperty('divider'))
            );
        }
        return this._config?.divider;
    }

    // #endregion

    // #region RENDER

    async render() {
        super.render();
        await this.onReady();
        this.insertDivider();
    }

    renderDivider() {
        const divider = this.getDivider();
        const node = document.createElement('span');
        node.classList.add('navLink__divider');
        if (typeof divider === 'string') {
            node.textContent = divider;
        }
        if (divider instanceof HTMLElement) {
            node.innerHTML = divider.innerHTML;
        }
        return node;
    }

    insertDivider() {
        const isLastNode = this.nextElementSibling === null;
        if (!isLastNode && this.getDivider() && !this.dividerNode) {
            this.dividerNode = this.renderDivider();
            this.after(this.dividerNode);
        }
    }

    // #endregion
}

customElements.define('nav-link', NavLink);

export default NavLink;
