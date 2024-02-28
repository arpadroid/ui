/**
 * Processes a template string and replaces the placeholders with the provided props.
 * @param {string} template - The template string.
 * @param {Record<string, string>} props - The props to replace the placeholders with.
 * @returns {string} The processed template.
 */
export function processTemplate(template, props = {}) {
    return template.replace(/{([^}]+)}/g, (match, p1) => {
        return props[p1] || '';
    });
}
