/**
 * @typedef {import('./tooltip.types.js').TooltipConfigType} TooltipConfigType
 */
import { defineCustomElement, listen, resolveNode, style } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement.js';

const html = String.raw;
class Tooltip extends ArpaElement {
    /** @type {TooltipConfigType} */
    _config = this._config;

    /**
     * Creates an instance of Tooltip.
     * @param {TooltipConfigType} config - The configuration object.
     */
    constructor(config) {
        super(config);
        this.bind('_onMouseMove', '_onMouseEnter', '_onMouseLeave');
    }

    static get observedAttributes() {
        return ['text', 'handler', 'icon', 'label'];
    }

    initializeProperties() {
        super.initializeProperties();
        const handler = this.getHandler();
        handler && this.setHandler(handler);
        return true;
    }

    /**
     * Sets the tooltip handler element.
     * @param {HTMLElement} handler - The handler element.
     */
    setHandler(handler) {
        this.handler = handler;
        this.handler.classList.add('tooltip__button');
        this.hasCursorPosition() && this._handleCursorPosition();
    }

    hasCursorPosition() {
        return this.getProperty('has-cursor-position');
    }

    getDefaultConfig() {
        /** @type {TooltipConfigType} */
        const config = {
            text: '',
            handler: '',
            icon: '',
            label: '',
            cursorPositionAxis: 'x',
            cursorTooltipPosition: 'top',
            position: 'top'
        };
        return super.getDefaultConfig(config);
    }

    /**
     * Returns the tooltip handler element.
     * @returns {HTMLElement | null | undefined}
     */
    getHandler() {
        let { handler } = this._config || {};
        if (handler instanceof HTMLElement) {
            return handler;
        }
        handler = this.closest('button') || this.getProperty('handler');
        return /** @type {HTMLElement} */ (handler && resolveNode(handler)) || this.closest('button, a');
    }

    getPosition() {
        return this.getProperty('position')?.trim() ?? 'top';
    }

    render() {
        this.innerHTML = '';
        this.classList.add('tooltip', `tooltip--${this.getPosition()}`);
        const text = this.getProperty('text');
        const template = html`
            ${this.renderButton()}
            <span zone="tooltip-content" class="tooltip__content" role="tooltip" aria-hidden="true">
                ${text}
            </span>
        `;

        this.innerHTML = template;
    }

    async _initializeNodes() {
        /** @type {HTMLElement | null} */
        this.contentNode = this.querySelector('.tooltip__content');
        this._childNodes && this.contentNode?.append(...this._childNodes);
        this.button = this.querySelector('.tooltip__button');
        const position = this.getPosition();
        position === 'cursor' && this._handleCursorPosition();
        return true;
    }

    /**
     * Sets the tooltip content.
     * @param {string | HTMLElement} content - The content to set.
     * @returns {Promise<void>}
     */
    async setContent(content = '') {
        if (!this._hasRendered) {
            return;
        }
        setTimeout(() => {
            if (!this.contentNode) return;
            this.contentNode.innerHTML = '';
            typeof content === 'string' && (this.contentNode.innerHTML = content);
            if (content instanceof HTMLElement) {
                this.contentNode.appendChild(content);
            }
        }, 0);
    }

    renderButton() {
        return !this.handler
            ? html`<icon-button
                  zone="handler"
                  class="tooltip__button"
                  type="button"
                  variant="minimal"
                  icon="${this.getProperty('icon')}"
              ></icon-button>`
            : '';
    }

    /////////////////////////////////////
    // #region Cursor Positioning
    ////////////////////////////////////

    _handleCursorPosition() {
        this.style.display = 'none';
        if (this.contentNode) {
            style(this.contentNode, { position: 'fixed', display: 'block' });
        }
        this._initializeCursorPosition();
        if (this.handler) {
            // @ts-ignore
            listen(this.handler, ['mousemove', 'touchmove'], this._onMouseMove);
            listen(this.handler, ['mouseenter', 'touchstart'], this._onMouseEnter);
            listen(this.handler, ['mouseleave'], this._onMouseLeave);
        }
    }

    _onMouseLeave() {
        this.style.display = 'none';
    }

    _onMouseEnter() {
        this.style.display = '';
    }

    /** @type {HTMLElement | null} */
    mouseTarget = null;

    /**
     * Handles the mouse target update event.
     * @param {MouseEvent} event - The target element.
     */
    _onMouseTargetUpdate(event) {
        const { onMouseTargetUpdate } = this._config || {};
        if (typeof onMouseTargetUpdate === 'function') {
            onMouseTargetUpdate(/** @type {HTMLElement} */ (event.target));
        }
    }
    /**
     * Handles the mouse move event.
     * @param {MouseEvent} event
     */
    _onMouseMove(event) {
        event.target !== this.mouseTarget && this._onMouseTargetUpdate(/** @type {MouseEvent} */ (event));
        this.mouseTarget = /** @type {HTMLElement | null} */ (event.target);
        const offset = 16;
        
        const content = this.contentNode;
        const handler = this.handler;
        if (!content) return;

        const position = this.getProperty('cursor-tooltip-position');
        const rect = handler?.getBoundingClientRect();
        if (!rect) return;
        const { clientX, clientY } = event;
        const axis = this.getProperty('cursor-position-axis') || 'x';
        if (axis === 'x') {
            /** @type {string | number} */
            let top = rect.top - content.clientHeight - offset;
            let left = clientX;
            position === 'bottom' && (top = rect.top + rect.height - offset);
            const leftLimit = content.clientWidth / 2 + offset;
            clientX - leftLimit < 0 && (left = leftLimit);
            const rightLimit = window.innerWidth - content.clientWidth / 2 - offset;
            clientX > rightLimit && (left = rightLimit);
            style(content, {
                top: content.clientHeight <= 0 ? 'auto' : `${top}px`,
                right: 'auto',
                bottom: 'auto',
                left: `${left}px`
            });
        } else if (axis === 'y') {
            let left = rect.x - offset - content.clientWidth;
            position === 'right' && (left = rect.x + rect.width);
            style(content, { top: `${clientY}px`, right: 'auto', bottom: 'auto', left: `${left}px` });
        }
    }

    /**
     * Sets the cursor position.
     * @param {'x' | 'y'} axis - The axis to set the cursor position.
     * @param {'top' | 'bottom' | 'right' | 'left'} position - The position to set the cursor.
     */
    setCursorPosition(axis, position) {
        this.setAttribute('cursor-position-axis', axis);
        this.setAttribute('cursor-tooltip-position', position);
        this._initializeCursorPosition();
    }

    _initializeCursorPosition() {
        const positions = ['top', 'bottom', 'left', 'right'];
        positions.forEach(position => this?.classList?.remove(`tooltip--${position}`));
        const cursorTooltipPosition = this.getProperty('cursor-tooltip-position');
        cursorTooltipPosition && this?.classList?.add(`tooltip--${cursorTooltipPosition}`);
    }

    // #endregion Cursor Positioning
}

defineCustomElement('arpa-tooltip', Tooltip);

export default Tooltip;
