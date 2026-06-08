const DESCRIPTION_MAX_LENGTH = 200;

function generateSlug(text) {
    if (!text || typeof text !== 'string') return '';
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function stripMarkdown(markdown) {
    return markdown
        .replace(/^#+\s+/gm, '')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        .replace(/>\s+/gm, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\n/g, ' ');
}

function extractDescription(markdown) {
    if (!markdown) return '';

    const lines = markdown.split('\n');
    let inCodeBlock = false;
    let paragraph = '';

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }
        if (inCodeBlock) continue;

        if (/^#{1,6}\s/.test(trimmed)) continue;
        if (!trimmed || /^[-*_]{3,}$/.test(trimmed)) continue;

        paragraph += (paragraph ? ' ' : '') + trimmed;

        if (paragraph.length >= DESCRIPTION_MAX_LENGTH) break;
    }

    paragraph = paragraph
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        .replace(/>\s+/gm, '');

    if (paragraph.length > DESCRIPTION_MAX_LENGTH) {
        paragraph = paragraph.slice(0, DESCRIPTION_MAX_LENGTH).trimEnd() + '...';
    }

    return paragraph;
}

function readMarkdown(filePath, fs) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch {
        return '';
    }
}

module.exports = { generateSlug, stripMarkdown, extractDescription, readMarkdown };
