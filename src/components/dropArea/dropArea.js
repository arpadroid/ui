/**
 * @typedef {import('./dropAreaInterface.js').DropAreaInterface} DropAreaInterface
 */

import { eventContainsFiles, mergeObjects, render, ObserverTool } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement.js';

const html = String.raw;
class DropArea extends ArpaElement {
    /////////////////////////
    // #region INITIALIZATION
    /////////////////////////

    constructor(config) {
        super(config);
        ObserverTool.mixin(this);
        this._onDrop = this.onDrop.bind(this);
        this._preventDefaultBehavior = this._preventDefaultBehavior.bind(this);
        this._onHandlerClick = this._onHandlerClick.bind(this);
        this._onHandlerEnter = this._onHandlerEnter.bind(this);
        this._onHandlerLeave = this._onHandlerLeave.bind(this);
    }

    /**
     * Returns default configuration for DropArea.
     * @returns {DropAreaInterface}
     */
    getDefaultConfig() {
        this.i18nKey = 'components.dropArea';
        return mergeObjects(super.getDefaultConfig(), {
            label: this.i18n('txtDropFiles'),
            icon: 'file_upload',
            handler: undefined,
            hasInput: false,
            inputTemplate: html`<input accept="image/*" type="file" />`,
            template: html`
                <button class="dropArea__handler" type="button">
                    <div class="dropArea__content">
                        <p class="dropArea__label" slot="label">{label}</p>
                    </div>
                    <arpa-icon class="dropArea__icon">{icon}</arpa-icon>
                    {input}
                </button>
            `
        });
    }

    // #endregion

    /////////////////////
    // #region RENDERING
    /////////////////////

    getTemplateVars() {
        return {
            label: !this.hasSlot('label') && this.getProperty('label'),
            icon: this.getProperty('icon'),
            input: render(this.hasInput(), this._config.inputTemplate)
        };
    }

    // #endregion

    /////////////////////
    // #region ACCESSORS
    /////////////////////

    hasInput() {
        return this.hasProperty('has-input');
    }

    getInput() {
        const inputId = this.getProperty('input-id');
        if (typeof inputId === 'string') {
            const input = document.getElementById(inputId);
            if (input) {
                return input;
            }
        }
        return this.getProperty('input') || this.querySelector('input[type="file"]');
    }

    // #endregion

    ////////////////////
    // #region LIFECYCLE
    ////////////////////

    _onConnected() {
        super._onConnected();
        this.classList.add('dropArea');
        if (this.hasInput()) {
            this.classList.add('dropArea--hasInput');
        }
        this._initializeInput();
        this._initializeHandler();
    }

    _initializeInput() {
        this.input = this.getInput();
    }

    _initializeHandler() {
        this.handlerNode = this.querySelector('.dropArea__handler');
        const node = this.handlerNode;
        if (node) {
            node.removeEventListener('click', this._onHandlerClick);
            node.addEventListener('click', this._onHandlerClick);
            node.addEventListener('drop', this._onDrop, false);
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                node.removeEventListener(eventName, this._preventDefaultBehavior, false);
                node.addEventListener(eventName, this._preventDefaultBehavior, false);
            });
            ['dragenter', 'dragover'].forEach(eventName => {
                node.removeEventListener(eventName, this._onHandlerEnter, false);
                node.addEventListener(eventName, this._onHandlerEnter, false);
            });
            ['dragleave', 'drop'].forEach(eventName => {
                node.removeEventListener(eventName, this._onHandlerLeave, false);
                node.addEventListener(eventName, this._onHandlerLeave, false);
            });
        }
    }

    // #endregion

    /////////////////
    // #region EVENTS
    /////////////////

    _onHandlerEnter() {
        this.handlerNode.classList.add('dropArea__handler--active');
    }

    _onHandlerLeave() {
        this.handlerNode.classList.remove('dropArea__handler--active');
    }

    _onHandlerClick() {
        this.input?.click();
    }

    _preventDefaultBehavior(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        const dt = event.dataTransfer;
        const files = Array.from(dt.files);
        this.onFileAdded(files, event);
    }

    onFileAdded(files, event) {
        const errors = [];
        const { onDrop, onError } = this._config;
        if ((event.dataTransfer && !eventContainsFiles(event)) || !files.length) {
            return;
        }
        if (errors.length) {
            if (onError) {
                this.signal('onError', errors, event);
                onError(errors, event);
            }
            return;
        }
        if (files?.length) {
            this.signal('onDrop', event, files);
            if (typeof onDrop === 'function') {
                onDrop(files, event);
            }
        }
    }

    // #endregion
}

customElements.define('drop-area', DropArea);

export default DropArea;
