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
            { name: 'Bits and Bytes', slug: 'bits-and-bytes' }, 
            { name: 'API Design Guidelines', slug: 'api-design-guidelines' },
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
            {
                name: 'Algebra',
                slug: 'algebra',
                isFolder: true,
                pages: [
                    { name: 'Core', slug: 'core' },
                    { name: 'Linear Functions', slug: 'linear-functions' },
                    { name: 'Quadratic Functions', slug: 'quadratic-functions' },
                    { name: 'Polynomial Functions', slug: 'polynomial-functions' },
                    { name: 'Rational Functions', slug: 'rational-functions' },
                    { name: 'Logarithmic & Exponential Functions', slug: 'logarithmic-and-exponential-functions' },
                    { name: 'Conic Sections', slug: 'conic-sections' },
                    { name: 'Trigonometry', slug: 'trigonometry' },
                ]
            },
            { name: 'Precalculus', slug: 'basic' },
            { name: 'Precalculus II', slug: 'basic2' },
            { name: 'Problem', slug: 'problem' },
        ]
    },
    {
        name: 'RAG',
        slug: 'rag',
        pages: [
            { name: 'FAQ', slug: 'faq' },
        ]
    },
    {
        name: 'System Design',
        slug: 'system-design',
        pages: [
            { name: 'Clock Skew and Time Sync', slug: 'clock-skew-and-time-sync' },
            { name: 'Consistent Hashing', slug: 'consistent-hashing' },
            { name: 'ID Generator', slug: 'id-generator' },
            { name: 'Template High Level Design', slug: 'template-high-level-design' }
        ]
    },
    {
        name: 'Neural Network',
        slug: 'neural-network',
        standalone: true
    },
    {
        name: 'Knowledge Graph',
        slug: 'knowledge-graph',
        standalone: true
    },
];

