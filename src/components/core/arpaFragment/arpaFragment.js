/**
 * @typedef {import('./arpaFragment.types.js').ArpaFragmentConfigType} ArpaFragmentConfigType
 */
import { defineCustomElement } from '@arpadroid/tools';
import ArpaNode from '../arpaNode/arpaNode.js';

class ArpaFragment extends ArpaNode {
    /** @type {ArpaFragmentConfigType} */
    _config = this._config;
    /**
     * Returns the default configuration for the ArpaFragment component.
     * @returns {ArpaFragmentConfigType}
     */
    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            tag: 'fragment'
        };
    }
}

defineCustomElement('arpa-frag', ArpaFragment);

export default ArpaFragment;
