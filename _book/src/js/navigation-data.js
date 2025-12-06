// Navigation data structure based on directory structure
// Standalone pages (no dropdown) have standalone: true
// Categories (with dropdown) have pages array
const navigationData = [
    {
        name: 'Introduction',
        slug: 'README',
        standalone: true
    },
    {
        name: 'P2P Chat',
        slug: 'p2p-chat',
        standalone: true
    },
    {
        name: 'ReactJS',
        slug: 'reactjs',
        standalone: true
    },
    {
        name: 'General',
        slug: 'general',
        pages: [
            { name: 'API Design Guidelines', slug: 'api-design-guidelines' },
            { name: 'Big Integer', slug: 'big-integer' },
            { name: 'Bits and Bytes', slug: 'bits-and-bytes' },
            { name: 'Character Encoding', slug: 'character-encoding' },
            { name: 'Database', slug: 'database' },
            { name: 'Kafka', slug: 'kafka' },
            { name: 'NAT and P2P Traversal', slug: 'nat-and-p2p-traversal' }
        ]
    },
    {
        name: 'Golang',
        slug: 'golang',
        pages: [
            { name: 'Goroutine', slug: 'goroutine' },
            { name: 'Strings', slug: 'strings' }
        ]
    },
    {
        name: 'Math',
        slug: 'math',
        pages: [
            { name: 'Basic', slug: 'basic' },
            { name: 'Polynomial', slug: 'polynomial' },
            { name: 'Problem', slug: 'problem' },
            { name: 'Quadratic Equation', slug: 'quadratic-equation' }
        ]
    },
    {
        name: 'RAG',
        slug: 'rag',
        pages: [
            { name: 'Chunking', slug: 'chunking' },
            { name: 'Crawling Result', slug: 'crawling-result' }
        ]
    },
    {
        name: 'System Design',
        slug: 'system-design',
        pages: [
            { name: 'Clock Skew and Time Sync', slug: 'clock-skew-and-time-sync' },
            { name: 'Consistent Hashing', slug: 'consistent-hashing' },
            { name: 'ID Generator', slug: 'id-generator' },
            { name: 'Template Component Design', slug: 'template-component-design' },
            { name: 'Template High Level Design', slug: 'template-high-level-design' }
        ]
    }
];

