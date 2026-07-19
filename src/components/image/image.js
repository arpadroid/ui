/**
 * @typedef {import('../dropArea/dropArea.js').default } DropArea
 * @typedef {import('../image/image.types').ImageConfigType} ImageConfigType
 * @typedef {import('../dialogs/dialog/dialog.js').default} Dialog
 * @typedef {import('../tooltip/tooltip.js').default} Tooltip
 * @typedef {import('../icon/icon.js').default} Icon
 */
import { classNames, attr, defineCustomElement, listen, $attr } from '@arpadroid/tools';
import { lazyLoad as lazyLoader, clearLazyImage, hasLoadedSource, editURL, mapHTML } from '@arpadroid/tools';
import { eventContainsFiles, addCssRule, observerMixin } from '@arpadroid/tools';
import { dummySignal, dummyListener, dummyOff } from '@arpadroid/tools';
import ArpaElement from '../core/arpaElement/arpaElement.js';

const html = String.raw;
class ArpaImage extends ArpaElement {
    ////////////////////////////
    // #region - INITIALIZATION
    ////////////////////////////
    _hasLoaded = false;
    _hasError = false;

    /** @type {ImageConfigType} */
    _config = this._config;

    constructor(config = {}) {
        super(config);
        this.signal = dummySignal;
        this.on = dummyListener;
        this.off = dummyOff;
        observerMixin(this);
        this.bind('_onLoad', '_onError', '_onInput', '_onDragEnter');
        /** @type {HTMLElement | undefined} */
        this.dropAreaNode = undefined;
        /** @type {string | null} */
        this.src = this.getProp('src');
    }

    /**
     * Gets the default configuration options for the component.
     * @returns {ImageConfigType} - The default configuration options.
     */
    getDefaultConfig() {
        this.i18nKey = 'ui.image';
        /** @type {ImageConfigType} */
        const config = {
            alt: '',
            caption: '',
            defaultSize: undefined,
            dropAreaHandler: undefined,
            errorClass: 'image--error',
            eventHandlerSelector: 'img',
            loadingClass: 'image--loading',
            hasPreloader: true,
            hasPreview: false,
            hasDropArea: false,
            hasThumbnail: true,
            highResSrc: '',
            icon: 'crop_original',
            iconBroken: 'broken_image',
            lazyLoad: false,
            lazyLoaderBatchSize: 5,
            hasNativeLazy: false,
            isDraggable: false,
            loadedClass: 'image--loaded',
            onError: undefined,
            onLoad: undefined,
            preventUpscale: false,
            previewTitle: '',
            params: ['width', 'height', 'quality'],
            quality: 50,
            sizes: [],
            sizeMap: {
                mini: 20,
                xx_small: 50,
                x_small: 100,
                small: 200,
                medium: 320,
                big: 600,
                large: 900,
                x_large: 1200,
                xx_large: 2500,
                huge: 4000,
                adaptive: '100%'
            },
            // i18n
            errLoad: '{i18n:errLoad}',
            lblLoadingImage: '{i18n:lblLoadingImage}',
            txtNoImage: '{i18n:txtNoImage}',
            txtUploadImage: '{i18n:txtUploadImage}'
        };
        return super.getDefaultConfig(config);
    }

    // #endregion - INITIALIZATION
    /**
     * Sets the source of the image.
     * @param {string} src - The source URL of the image.
     */
    setSource(src = '') {
        this.src = src;
        if (this.image instanceof HTMLImageElement) {
            this.image.src = src;
        }
    }

    ///////////////////////
    // #region - Get
    ///////////////////////

    // #region - - Size

    /**
     * Gets the default size of the Image.
     * @returns {number}
     */
    getDefaultSize() {
        const sizes = this.getArrayProp('sizes');
        const defaultSize = this.getProp('defaultSize');
        const sizeMap = this._config?.sizeMap;
        // @ts-ignore
        const size = Number(sizeMap?.[defaultSize]);
        return size || (Array.isArray(sizes) && sizes[0]);
    }

    /**
     * Gets the size of the Image.
     * @returns {number}
     */
    getSize() {
        const size = this.getProp('size') || this.getDefaultSize();
        if (size === 'adaptive') {
            return 600;
        }
        if (size === 'full_screen') {
            return Math.ceil(window.innerWidth / 250) * 250;
        }
        return Number(size);
    }

    /**
     * Gets the sources of the Image as a number array.
     * @returns {number[] | undefined}
     */
    getSizes() {
        /** @type {(string | number)[]} */
        let sizes = this.getArrayProp('sizes');
        if (!sizes?.length && this.getAttribute('size') === 'full_screen') {
            sizes = [400, 800, 1200, 1600, 2400];
        }
        if (sizes?.length) {
            const sizeMap = /** @type {Record<string, string | number>} */ (
                /** @type {unknown} */ (this._config.sizeMap || {})
            );
            return sizes.map(size => Number(sizeMap[String(size)] || size));
        }
        return [];
    }

    /**
     * Sets the size of the Image.
     * @param {number} width
     * @param {number} height
     */
    setSize(width, height = width) {
        if (width === this.getWidth() && height === (this.getHeight() || width)) {
            return;
        }
        this._hasLoaded = false;
        this.removeSizeClass();
        this.classList.remove(this.getProp('loadedClass'));
        width && (this._config.width = width);
        height && (this._config.height = height);
        this.setAttribute('size', String(width));
        this._hasLoaded = false;
        this._hasError = false;
        this._hasRendered && this.reRender();
    }

    getWidth() {
        return this.getProp('width') || this.getSize();
    }

    getHeight() {
        return this.getProp('height');
    }

    // #endregion - Size

    /**
     * Loads a source image.
     * @param {string} src - The source of the image to load.
     */
    loadImage(src) {
        this.image && (this.image.src = src);
        this._hasLoaded = false;
        this._hasError = false;
        this.initializeImage();
    }

    getSource() {
        return this.getProp('src');
    }

    getQuality() {
        return this.getProp('quality');
    }

    /**
     * Gets the URL for the image with the specified width, height, and quality.
     * @param {number | string} width
     * @param {number | string} height
     * @param {number | string} quality
     * @param {string} src
     * @returns {string} - The URL for the image.
     */
    getImageURL(
        width = this.getWidth(),
        height = this.getHeight(),
        quality = this.getQuality(),
        src = this.getSource()
    ) {
        if (!height) {
            src = src?.replace(/&height=\[height\]/, '');
        }
        return (
            src
                ?.replace('[width]', String(width))
                ?.replace('[height]', String(height))
                ?.replace('[quality]', String(quality)) || ''
        );
    }

    isLoading() {
        return Boolean(this.src && !this.image?.naturalWidth && !this._hasLoaded);
    }

    // #region - - Has

    hasError() {
        return Boolean(this._hasError);
    }

    hasPreloader() {
        return this.getProp('hasPreloader') && this.isLoading() && !this.hasError();
    }

    hasLoaded() {
        return this._hasLoaded;
    }

    hasThumbnail() {
        return this.hasProp('hasThumbnail') && (!this.hasLoaded() || !this.getSource() || this.hasError());
    }

    hasLazyLoad() {
        return this.hasProp('lazyLoad') && !hasLoadedSource(this.getImageURL());
    }

    /**
     * Determines whether the component has a high-resolution preview image.
     * @returns {boolean} - True if the component has a high-resolution preview image; otherwise, false.
     */
    hasPreview() {
        return Boolean(this.getProp('highResSrc') || this.hasProp('hasPreview'));
    }

    // #endregion - Has

    /**
     * Busts the cache for the image.
     */
    bustCache() {
        this.image && (this.image.src = editURL(this.image.src, { bustCache: new Date().getTime() }));
    }

    /**
     * Stops preloading the component.
     * @param {string} addClass - The class to add to the component.
     */
    stopPreloading(addClass = this.getProp('loadedClass')) {
        !this.classList.contains(addClass) && this.classList.add(addClass);
        setTimeout(() => this.querySelector('circular-spinner')?.remove(), 30);
    }

    /**
     * Shows the drop area for the component.
     */
    showDropArea() {
        this.dropAreaNode && (this.dropAreaNode.style.display = '');
        requestAnimationFrame(() => this.dropAreaNode && (this.dropAreaNode.style.opacity = '1'));
    }

    /**
     * Hides the drop area for the component.
     */
    hideDropArea() {
        requestAnimationFrame(() => this.dropArea && (this.dropArea.style.opacity = '0'));
    }

    // #endregion - ACCESSORS

    ////////////////////////////
    // #region - Render
    ///////////////////////////

    /**
     * Renders the component.
     */

    reRender() {
        this._hasLoaded = false;
        this._hasError = false;
        super.reRender();
    }

    $renderTemplate() {
        this.initializeStyles();
        this.isLoading() && this.classList.add(this.getProp('loadingClass'));
        const hasCaption = this.hasContent('caption');
        const previewSrc = this.getProp('highResSrc') || this.getImageURL(2400, 1600, 80);
        const hasPreview = this.hasPreview();
        if (hasPreview) {
            this._config.hasThumbnail = false;
        }
        return html`
            <!-- Open Button -->
            ${hasPreview ? '<button class="image__previewButton" type="button">' : ''}
            <!-- Open Figure -->
            ${hasCaption ? '<figure>' : ''}
            <picture>
                <arpa-node
                    name="thumbnail"
                    tag="arpa-tooltip"
                    class="image__thumbnail"
                    icon="{icon}"
                    can-render="hasPreview() || hasThumbnail()"
                >
                    ${this.hasError() ? '{errLoad}' : '{txtNoImage}'}
                </arpa-node>

                <arpa-node
                    name="preloader"
                    tag="circular-spinner"
                    aria-label="${this.getText('lblLoadingImage')}"
                    can-render="hasPreloader()"
                ></arpa-node>

                {renderSources()}

                <arpa-node
                    name="image"
                    tag="img"
                    alt="{alt}"
                    draggable="{isDraggable}"
                    ${$attr(this.getImageAttributes())}
                    can-render="getImageURL()"
                ></arpa-node>

                <arpa-node
                    tag="drop-area"
                    name="dropArea"
                    label="${this.getText('txtUploadImage')}"
                    can-render="hasDropArea"
                ></arpa-node>
            </picture>

            <arpa-node tag="figcaption" name="caption" can-render="caption"></arpa-node>

            <arpa-node
                tag="image-preview"
                name="preview"
                title="{previewTitle}"
                image="${previewSrc}"
                can-render="hasPreview()"
            ></arpa-node>

            ${hasCaption ? html`</figure>` : ''}
            <!-- Close Button -->
            ${hasPreview ? html`</button>` : ''}
        `;
    }

    getImageAttributes() {
        const src = this.getImageURL();
        const lazyLoad = this.hasLazyLoad();
        const hasNativeLazy = this.getProp('hasNativeLazy');
        return {
            class: classNames({ 'image--lazy': Boolean(lazyLoad) ? 'image--lazy' : false }),
            'data-src': lazyLoad && !hasNativeLazy ? src : '',
            lazyLoad: lazyLoad && !hasNativeLazy,
            loading: (lazyLoad && hasNativeLazy && 'lazy') || undefined,
            src: lazyLoad && !hasNativeLazy ? '' : src
        };
    }

    renderSources() {
        const sizes = this.getSizes()
            ?.sort((item1, item2) => item1 - item2)
            ?.reverse();
        if (!Array.isArray(sizes) || !sizes.length) return '';
        const quality = this.getProp('quality');
        /**
         * Renders a source element for the image.
         * @param {number[]} sizes
         * @param {number} size
         * @returns {string}
         */
        const render = (sizes, size) => {
            const src = this.getImageURL(size, undefined, quality);
            const prop = size === sizes[sizes.length - 1] ? 'min-width' : 'max-width';
            return html`<source srcset="${src}" media="(${prop}: ${size}px)" />`;
        };
        return mapHTML(sizes, size => render(sizes, size));
    }

    // #endregion - Rendering

    //////////////////////////
    // #region - Drop Area
    //////////////////////////

    /**
     * Initializes the drop area for the component.
     */
    async initializeDropArea() {
        /** @type {DropArea | null} */
        this.dropArea = this.querySelector('drop-area');
        if (!this.dropArea) return;
        this.dropArea.addConfig({
            hasInput: this.getProp('hasDropAreaInput'),
            handler: this.getProp('dropAreaHandler') || this
        });
        await this.dropArea?.promise;
        this.dropArea?.on('drop', this._onInput);
        this.dropArea?.on('error', this.hideDropArea);
        this.addEventListener('dragenter', this._onDragEnter);
        this.addEventListener('dragleave', event => {
            if (event.relatedTarget instanceof HTMLElement && this.contains(event.relatedTarget)) {
                return;
            }
            this.dropArea && (this.dropArea.style.opacity = '0');
        });
    }

    /**
     * Called when an item is dragged over the component.
     * @param {DragEvent} event
     * @returns {void}
     */
    _onDragEnter(event) {
        if (event.relatedTarget instanceof HTMLElement && this.contains(event.relatedTarget)) {
            return;
        }
        if (eventContainsFiles(event)) {
            this.dropArea && (this.dropArea.style.opacity = '1');
        }
    }

    // #endregion - Drop Area

    ////////////////////
    // #region - Styles
    ////////////////////

    initializeStyles() {
        const size = this.getProp('size');
        const height = this.getHeight() || this.getSize();
        const width = this.getWidth();
        this.removeSizeClasses();
        this.addSizeClass();

        if (['adaptive', 'full_screen'].includes(size)) {
            this.classList.add('image--size-adaptive');
        } else if (width || height) {
            width === height && this.classList.add('image--square');
            const className = `image--size-${width}x${height}`;
            if (this.classList.contains(className)) return;
            this.classList.add(className);
            let css = '';
            if (width === 'auto' && height) {
                css += 'max-width: 100%;';
                css += 'width: auto;';
                css += `height: ${height}px;`;
            } else if (height === 'auto' && width) {
                css += 'max-height: 100%;';
                css += `width: ${width}px;`;
                css += 'height: auto;';
            } else {
                css = `max-width: 100%; 
                width: ${width}px;
                height: auto;`;
            }
            addCssRule(`.${className}.${className}`, css);
            addCssRule(`.${className} picture`, `aspect-ratio: ${width} / ${height};`);
        }
    }

    addSizeClass(width = this.getWidth()) {
        const size = this.getSizeKey(width);
        size && this.classList.add(`image--size-${size}`);
    }

    removeSizeClass() {
        this.classList.remove(`image--size-${this.getSizeKey()}`);
    }

    removeSizeClasses() {
        const classes = Array.from(this.classList).filter(
            className => !className.startsWith('image--size-') && className !== 'image--square'
        );
        this.setAttribute('class', classes.join(' '));
    }

    getSizeKey(width = this.getWidth()) {
        for (const [key, value] of Object.entries(this._config.sizeMap || {})) {
            if (value >= width) {
                return key;
            }
        }
    }

    // #endregion - Styles

    ///////////////////////
    // #region - Lifecycle
    ///////////////////////

    async $initializeNodes() {
        await super.$initializeNodes();
        const imagePosition = this.getProp('imagePosition');
        this.image && imagePosition && (this.image.style.objectPosition = imagePosition);
        return true;
    }

    async $onConnected() {
        /** @type {HTMLImageElement | null} */
        this.image = this.querySelector('img');
        /** @type {Tooltip | null} */
        this.thumbnail = this.querySelector('.image__thumbnail');
        /** @type {HTMLPictureElement | null} */
        this.picture = this.querySelector('picture');
        this.hasProp('hasDropArea') && this.initializeDropArea();
        this.initializeImage();
        const batchSize = this.getProp('lazyLoaderBatchSize');
        this.hasLazyLoad() &&
            !this.getProp('hasNativeLazy') &&
            this.image &&
            lazyLoader(this.image, Number(batchSize));
    }

    $onDestroy() {
        super.$onDestroy();
        this._hasRendered = false;
        this._hasLoaded = false;
        this._hasError = false;
        const hasNativeLazy = this.getProp('hasNativeLazy');
        this.image?.removeEventListener('load', this._onLoad);
        this.image?.removeEventListener('error', this._onError);
        if (this.hasLazyLoad() && this.image instanceof HTMLImageElement) {
            this.image.dataset.src = '';
            !hasNativeLazy && clearLazyImage(this.image);
        }
        this.image && (this.image.src = '');
        this.image = null;
        this.thumbnail = null;
        this.picture = null;
    }

    // #endregion - LIFECYCLE

    ///////////////////////
    // #region - Events
    ///////////////////////

    /**
     * Loads the image.
     * @param {HTMLImageElement | null | undefined} image - The source of the image to load.
     * @param {ImageConfigType} config - The configuration options for the image.
     * @returns {Promise<HTMLImageElement | undefined>} - The image element.
     */
    async initializeImage(image = this.image, config = this._config || {}) {
        await this.promise;
        if (image instanceof HTMLImageElement) {
            listen(image, 'load', this._onLoad);
            listen(image, 'error', this._onError);
            attr(image, { alt: config.alt, width: config.width, height: config.height });
            if (image.naturalWidth) {
                this._onLoad();
            }
            return image;
        }
    }

    /**
     * Called when the image has finished loading.
     * @param {Event | undefined} [event]
     */
    _onLoad(event) {
        const { onLoad } = this._config;
        typeof onLoad === 'function' && onLoad(event, this);
        this._hasLoaded = true;
        this.stopPreloading();
        this.classList.remove(this.getProp('loadingClass'));
        this.classList.remove(this.getProp('errorClass'));
        if (this.picture && this.image && this.hasProp('preventUpscale') && this.image?.naturalWidth > 0) {
            this.picture.style.maxWidth = this.image.naturalWidth + 'px';
            this.picture.style.maxHeight = this.image.naturalHeight + 'px';
        }
        this.signal('load', { image: this.image, event });
    }

    /**
     * Called when the image has failed to load.
     * @param {Event} event
     */
    _onError(event) {
        this._hasError = true;
        this._hasLoaded = true;
        const { onError } = this._config;
        typeof onError === 'function' && onError(event, this);
        this.stopPreloading(this.getProp('errorClass'));
        this.classList.remove(this.getProp('loadingClass'));
        this.signal('error', { image: this.image, event });
        const message = this.getProp('errLoad');
        this.thumbnail?.setContent(message);
        /** @type {Icon | null | undefined} */
        const icon = this.thumbnail?.querySelector('arpa-icon');
        icon?.setIcon(this.getProp('iconBroken'));
    }

    /**
     * Called when an image is dropped onto the component.
     * @param {FileList} files - The files that were dropped onto the component.
     * @param {DragEvent} event - The drag event.
     */
    _onInput(files, event) {
        const { onInput } = this._config;
        typeof onInput === 'function' && onInput(Array.from(files), event, this);
        this.hideDropArea();
    }

    // #endregion - EVENTS

    //////////////////////////
    // #region - Uploads
    //////////////////////////

    /**
     * Called when the image has been uploaded.
     * @param {Response} response - The response from the server.
     * @returns {Promise<Response>} - A promise that resolves when the component has been updated.
     */
    onImageUploaded(response) {
        this.render();
        return Promise.resolve(response);
    }

    /**
     * Called when an error occurs while uploading the image.
     * @param {Response} response - The response from the server.
     * @returns {Promise<Response>} - A promise that rejects with the response.
     */
    onImageUploadError(response) {
        // const message = response?.value?.message ?? 'Unable to upload image.';
        // Context.Messenger.error(message);
        return Promise.reject(response);
    }

    /**
     * Displays a confirmation modal before uploading the image.
     */
    //  @param {() => Promise} postImage - The function to call to upload the image.
    uploadConfirmModal() {
        // params: postImage
        // const dialog = DialogService.openConfirmModal({
        //     content: 'If you continue the existing image will be replaced.',
        //     title: 'Upload image',
        //     variant: 'small',
        //     icon: 'upload',
        //     onConfirm: () => postImage(dialog)
        // });
    }

    /**
     * Uploads an image.
     * @param {() => Promise<Response>} post - The function to call to upload the image.
     * @returns {Promise<Response>} - A promise that resolves when the image has been uploaded.
     */
    uploadImage(post) {
        return new Promise((resolve, reject) => {
            /**
             * Posts the image to the server.
             * @param {Dialog} [dialog] - The dialog to close.
             * @returns {Promise<Response>} - A promise that resolves when the image has been uploaded.
             */
            const postImage = async dialog => {
                dialog?.close();
                return post()
                    .then(response => {
                        resolve(response);
                        return this.onImageUploaded(response);
                    })
                    .catch(response => {
                        dialog?.close();
                        reject(response);
                        return this.onImageUploadError(response);
                    });
            };
            if (this.src) {
                // this.uploadConfirmModal(postImage);
                return;
            }
            postImage();
        });
    }
}

defineCustomElement('arpa-image', ArpaImage);

export default ArpaImage;
