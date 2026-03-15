/**
 * @typedef {import('./tooltip.types.js').TooltipConfigType} TooltipConfigType
 * @typedef {import('../iconButton/iconButton.js').default} IconButton
 */
import { defineCustomElement, listen, normalizeTouchEvent, resolveNode, style } from '@arpadroid/tools';
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

    initializeProperties() {
        super.initializeProperties();
        this.setHandler(this.getHandler());
        return true;
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

    /**
     * Sets the tooltip handler element.
     * @param {HTMLElement | unknown} handler - The handler element.
     */
    setHandler(handler) {
        if (!(handler instanceof HTMLElement)) return;
        this.handler = handler;
        this.handler.classList.add('tooltip__button');
        this.hasCursorPosition() && this._handleCursorPosition();
    }

    hasCursorPosition() {
        return this.getProperty('has-cursor-position');
    }

    /**
     * Returns the default configuration for the tooltip component.
     * @returns {TooltipConfigType} The default configuration object.
     */
    getDefaultConfig() {
        /** @type {TooltipConfigType} */
        const config = {
            text: '',
            handler: '',
            icon: '',
            label: '',
            className: 'tooltip',
            cursorPositionAxis: 'x',
            cursorTooltipPosition: 'top',
            position: 'top',
            templateChildren: {
                handler: {
                    canRender: () => !this.handler,
                    tag: 'icon-button',
                    hasZone: false,
                    attr: {
                        buttonZone: 'handler',
                        type: 'button',
                        variant: 'minimal',
                        icon: '{icon}'
                    }
                },
                content: {
                    canRender: true,
                    className: 'tooltip__content',
                    zoneName: 'tooltip-content',
                    tag: 'span',
                    content: '{text}',
                    attr: { role: 'tooltip', ariaHidden: 'true' }
                }
            }
        };
        return super.getDefaultConfig(config);
    }

    getTemplateVars() {
        return {
            ...super.getTemplateVars(),
            icon: this.getProperty('icon'),
            label: this.getProperty('label'),
            text: this.getProperty('text')
        };
    }

    _getTemplate() {
        return html`{handler}{content}`;
    }

    getPosition() {
        return this.getProperty('position')?.trim() ?? 'top';
    }

    async _initializeNodes() {
        await super._initializeNodes();
        const position = this.getPosition();
        this.classList.add('tooltip', `tooltip--${position}`);

        const handler = /** @type {IconButton} */ (this.querySelector('.tooltip__handler'));
        if (handler) {
            this.handler = handler;
            await handler.promise;
        }
        this.button = this.querySelector('.tooltip__handler button');
        position === 'cursor' && this._handleCursorPosition();
        /** @type {HTMLElement | null} */
        this.contentNode = this.querySelector('.tooltip__content');
        this._childNodes && this.contentNode?.append(...this._childNodes);

        return true;
    }

    /**
     * Sets the tooltip content.
     * @param {string | HTMLElement | HTMLCollection | NodeList} content - The content to set.
     * @returns {Promise<void>}
     */
    async setContent(content = '') {
        await new Promise(resolve => requestIdleCallback(resolve));
        const contentNode = this.contentNode || this.querySelector('.tooltip__content');
        !this._hasRendered && (await this.promise);
        if (!contentNode) return;
        contentNode.innerHTML = '';
        if (typeof content === 'string') {
            contentNode.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentNode.appendChild(content);
        } else if (content instanceof HTMLCollection || content instanceof NodeList) {
            contentNode.append(...content);
        }
    }

    /////////////////////////////////////
    // #region Cursor Positioning
    ////////////////////////////////////

    _handleCursorPosition() {
        if (!this.contentNode) {
            this.contentNode = this.querySelector('.tooltip__content');
        }
        if (this.contentNode) {
            style(this.contentNode, { position: 'fixed', display: 'block' });
        }
        this._initializeCursorPosition();
        if (this.handler) {
            // @ts-ignore
            listen(this.handler, ['mousemove', 'touchmove'], this._onMouseMove);
            listen(this.handler, ['mouseenter', 'touchmove'], this._onMouseEnter);
            listen(this.handler, ['mouseleave', 'touchend'], this._onMouseLeave);
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
     * @param {HTMLElement | null} target - The target element.
     * @param {MouseEvent | TouchEvent} event
     */
    _onMouseTargetUpdate(target, event) {
        const { onMouseTargetUpdate } = this._config || {};
        if (typeof onMouseTargetUpdate === 'function') {
            onMouseTargetUpdate(/** @type {HTMLElement} */ (target), event);
        }
    }
    /**
     * Handles the mouse move event.
     * @param {MouseEvent | TouchEvent} event
     */
    _onMouseMove(event) {
        const { target, clientX, clientY } = normalizeTouchEvent(event);
        target !== this.mouseTarget && this._onMouseTargetUpdate(target, event);
        this.mouseTarget = /** @type {HTMLElement | null} */ (target);
        const offset = 16;
        const content = this.contentNode;
        const handler = this.handler;
        if (!content) return;

        const position = this.getProperty('cursor-tooltip-position');
        const rect = handler?.getBoundingClientRect();
        if (!rect) return;

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
