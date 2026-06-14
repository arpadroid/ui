/**
 * @typedef {import('./dropArea.types').DropAreaConfigType} DropAreaConfigType
 * @typedef {import('@arpadroid/tools').ObserverType} ObserverType
 */
import { eventContainsFiles, mergeObjects, observerMixin } from '@arpadroid/tools';
import { dummySignal, dummyListener, defineCustomElement, listen } from '@arpadroid/tools';
import ArpaElement from '../core/arpaElement/arpaElement.js';

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
        this.bind('_onHandlerLeave', '_preventDefaultBehavior', '_onHandlerClick', '_onHandlerEnter');
        this._onDrop = this.onDrop.bind(this);
    }

    /**
     * Returns default configuration for DropArea.
     * @returns {DropAreaConfigType}
     */
    getDefaultConfig() {
        this.i18nKey = 'ui.dropArea';
        return mergeObjects(super.getDefaultConfig(), {
            label: '{i18n:txtDropFiles}',
            icon: 'file_upload',
            handler: undefined,
            hasInput: false
        });
    }

    // #endregion

    /////////////////////
    // #region RENDERING
    /////////////////////

    $renderTemplate() {
        return html`
            <button class="dropArea__handler fieldInput" type="button">
                <div class="dropArea__content">
                    <arpa-icon class="dropArea__icon">{icon}</arpa-icon>
                    <p class="dropArea__label" zone="label">{label}</p>
                </div>
                <arpa-node can-render="hasInput" tag="input" name="input" accept="image/*" type="file">
                </arpa-node>
            </button>
        `;
    }

    // #endregion

    /////////////////////
    // #region ACCESSORS
    /////////////////////

    /**
     * Returns the input element.
     * @returns {HTMLElement | null}
     */
    getInput() {
        const inputId = this.getProp('input-id');
        if (typeof inputId === 'string') {
            const input = document.getElementById(inputId);
            if (input) return input;
        }
        const input = /** @type {unknown} */ (this.getProp('input'));
        if (input instanceof HTMLInputElement) return input;
        return this.querySelector('input[type="file"]');
    }

    // #endregion

    ////////////////////
    // #region LIFECYCLE
    ////////////////////

    $onConnected() {
        super.$onConnected();
        this.classList.add('dropArea');
        if (this.hasProp('hasInput')) {
            this.classList.add('dropArea--hasInput');
        }
        this._initializeInput();
        /** @type {HTMLElement | null} */
        this.handlerNode = this.querySelector('.dropArea__handler');
        this._initializeHandler();
    }

    _initializeInput() {
        this.input = this.getInput();
    }

    _initializeHandler(node = this.handlerNode) {
        if (!node) return;
        listen(node, 'click', this._onHandlerClick);
        listen(node, 'drop', this._onDrop, false);
        listen(node, ['dragenter', 'dragover', 'dragleave', 'drop'], this._preventDefaultBehavior, false);
        listen(node, ['dragenter', 'dragover'], this._onHandlerEnter, false);
        listen(node, ['dragleave', 'drop'], this._onHandlerLeave, false);
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
     * @param {Event} event
     */
    onDrop(event) {
        if (!(event instanceof DragEvent)) return;
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
     * @param {File[]} files
     * @param {DragEvent} event
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
