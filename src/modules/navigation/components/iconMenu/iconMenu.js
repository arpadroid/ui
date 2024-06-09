/** @typedef {import('./iconMenuInterface').IconMenuInterface} IconMenuInterface */

import { mergeObjects, attrString } from '@arpadroid/tools';
import { ArpaElement, InputCombo } from '../../../../exports.js';

const html = String.raw;
class IconMenu extends ArpaElement {
    _bindings = ['preProcessNode'];
    /**
     * Returns default config.
     * @returns {IconMenuInterface}
     */
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            className: 'iconMenu',
            menuPosition: 'bottom',
            icon: 'more_horiz',
            hasTabIndex: false,
            links: [],
            navComboClasses: 'selectCombo'
        });
    }

    async onReady() {
        await customElements.whenDefined('icon-menu');
        await customElements.whenDefined('nav-list');
        return true;
    }

    async render() {
        const template = html`${this.renderButton()}${this.renderNav()}`;
        this.innerHTML = template;
        this.navigation = this.querySelector('.iconMenu__navigation');
        this.button = this.querySelector('.iconMenu__button');
    }

    _onConnected() {
        const listItems = this._childNodes.filter(node => node.tagName === 'NAV-LINK');
        this.navigation.preProcessNode(this.preProcessNode);
        this.navigation.addItemNodes(listItems);
        this.navigation.setLinks(this._config.links);
        this.navigation.prepend(...this._childNodes);
        this._initializeInputCombo();
    }

    renderButton() {
        const buttonAttr = attrString({ label: this.getProperty('label'), icon: this.getProperty('icon') });
        return html`<button is="icon-button" class="iconMenu__button" ${buttonAttr}></button>`;
    }

    renderNav() {
        return html`<nav-list class="iconMenu__navigation comboBox" id="${this.getId()}-navList"></nav-list>`;
    }

    async preProcessNode(node) {
        node.classList.add('comboBox__item');
        !this.getProperty('has-tab-index') &&
            Array.from(node.querySelectorAll('a, button')).forEach(node =>
                node.setAttribute('tabindex', '-1')
            );
    }

    _initializeInputCombo() {
        this.inputCombo = new InputCombo(this.button, this.navigation, {
            position: this.getProperty('menu-position'),
            containerSelector: 'nav-link',
            ...(this._config.inputComboConfig ?? {})
        });
    }

    getId() {
        return this.getProperty('id') || 'IconMenu-' + Math.random().toString(36).substr(2, 9);
    }
}
customElements.define('icon-menu', IconMenu);
export default IconMenu;
