/**
 * @typedef {import('../arpaElement.types').ArpaElementContentNodeType} ArpaElementContentNodeType
 */

/**
 * @param {ArpaElementContentNodeType} node
 * @param {(node: ArpaElementContentNodeType, nodes: ArpaElementContentNodeType[]) => Promise<boolean | ArpaElementContentNodeType[]>} callback
 * @returns {Promise<ArpaElementContentNodeType[]>}
 */
export async function findChildren(node, callback) {
    /** @type {ArpaElementContentNodeType[]} */
    const children = [];
    let found = await callback(node, children);
    if (found) return children;

    const nodes = 'nodes' in node ? node.nodes : {};

    for (const [, child] of Object.entries(nodes || {})) {
        if ('promise' in child) {
            await child.promise;
        }
        found = await callback(child, children);
        if (found) return children;
    }

    return children;
}

/**
 * Finds children by attribute.
 * @param {ArpaElementContentNodeType} element
 * @param {string} attr
 * @param {string} value
 * @returns {Promise<ArpaElementContentNodeType[]>}
 */
export async function findChildrenByAttribute(element, attr, value) {
    const children = await findChildren(element, async (child, children) => {
        if (child?.getAttribute?.(attr) === `{${value}}`) {
            children.push(child);
            return true;
        }
        if ('onRendered' in child) await child.onRendered();
        if ('promise' in child) await child.promise;
        const selected = Array.from(child.querySelectorAll(`[${CSS.escape(attr)}="{${CSS.escape(value)}}"]`));
        if (selected) {
            children.push(...selected);
        }
        return children.length > 0;
    });

    /**
     * @param {ArpaElementContentNodeType} child
     * @param {ArpaElementContentNodeType[]} children
     */
    const processChild = async (child, children) => {
        const eventHandlerSelector = 'getProp' in child && child.getProp('eventHandlerSelector');
        if (eventHandlerSelector) {
            'promise' in child && (await child?.promise);
            children.push(...Array.from(child.querySelectorAll(eventHandlerSelector)));
            children.splice(children.indexOf(child), 1);
        }
    };

    for (const child of children) {
        await processChild(child, children);
    }
    return children;
}
