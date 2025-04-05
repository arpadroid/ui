/**
 * @typedef {import('./dropArea.types').DropAreaConfigType} DropAreaConfigType
 * @typedef {import('@arpadroid/tools').ObserverType} ObserverType
 */
import { eventContainsFiles, mergeObjects, render, observerMixin } from '@arpadroid/tools';
import { dummySignal, dummyListener, defineCustomElement } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement.js';

const html = String.raw;
class DropArea extends ArpaElement {
    /////////////////////////
    // #region INITIALIZATION
    /////////////////////////

    /**
     * Creates an instance of DropArea.
     * @param {DropAreaConfigType} config - The configuration object.
     */
    constructor(config = {}) {
        super(config);
        this.signal = dummySignal;
        this.on = dummyListener;
        observerMixin(this);

        this._onDrop = this.onDrop.bind(this);
        this._preventDefaultBehavior = this._preventDefaultBehavior.bind(this);
        this._onHandlerClick = this._onHandlerClick.bind(this);
        this._onHandlerEnter = this._onHandlerEnter.bind(this);
        this._onHandlerLeave = this._onHandlerLeave.bind(this);
    }

    /**
     * Returns default configuration for DropArea.
     * @returns {DropAreaConfigType}
     */
    getDefaultConfig() {
        this.i18nKey = 'ui.dropArea';
        return mergeObjects(super.getDefaultConfig(), {
            label: this.i18n('txtDropFiles'),
            icon: 'file_upload',
            handler: undefined,
            hasInput: false,
            inputTemplate: html`<input accept="image/*" type="file" />`,
            template: html`
                <button class="dropArea__handler fieldInput" type="button">
                    <div class="dropArea__content">
                        <arpa-icon class="dropArea__icon">{icon}</arpa-icon>
                        <p class="dropArea__label" zone="label">{label}</p>
                    </div>
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
            label: !this.hasZone('label') && this.getProperty('label'),
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

    /**
     * Returns the input element.
     * @returns {HTMLElement | null}
     */
    getInput() {
        const inputId = this.getProperty('input-id');
        if (typeof inputId === 'string') {
            const input = document.getElementById(inputId);
            if (input) return input;
        }
        const input = /** @type {unknown} */ (this.getProperty('input'));
        if (input instanceof HTMLInputElement) return input;
        return this.querySelector('input[type="file"]');
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
        /** @type {HTMLElement | null} */
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
        this.handlerNode?.classList.add('dropArea__handler--active');
    }

    _onHandlerLeave() {
        this.handlerNode?.classList.remove('dropArea__handler--active');
    }

    _onHandlerClick() {
        this.input?.click();
    }

    /**
     * Prevents the default behavior of an event.
     * @param {Event} event
     */
    _preventDefaultBehavior(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Handles the drop event.
     * @param {DragEvent} event
     */
    onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        const dt = event.dataTransfer;
        if (dt) {
            const files = Array.from(dt.files);
            this.onFileAdded(files, event);
        }
    }

    /**
     * Handles the addition of files.
     * @param {File[]} files - The list of files.
     * @param {DragEvent} event - The drag event.
     */
    onFileAdded(files, event) {
        /** @type {string[]} */
        const errors = [];
        const { onDrop, onError } = this._config;
        if ((event.dataTransfer && !eventContainsFiles(event)) || !files.length) {
            return;
        }
        if (errors.length) {
            if (onError) {
                this.signal('error', errors, event);
                onError(errors, event);
            }
            return;
        }
        if (files?.length) {
            this.signal('drop', event, files);
            if (typeof onDrop === 'function') {
                onDrop(files, event);
            }
        }
    }

    // #endregion
}

defineCustomElement('drop-area', DropArea);

export default DropArea;
