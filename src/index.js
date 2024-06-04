import * as ui from './exports.js';
export * from './exports.js';

/**
 * Bootstrap the UI.
 */
(function bootstrap() {
    if (typeof window === 'undefined') {
        return;
    }
    if (typeof window.arpadroid === 'undefined') {
        window.arpadroid = {};
    }
    window.arpadroid.ui = ui;
})();
