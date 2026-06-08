/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert
 * @returns {string} - URL-friendly slug
 */
function generateSlug(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
