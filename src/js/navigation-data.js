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
                name: 'Precalculus',
                slug: 'precalculus',
                isFolder: true,
                pages: [
                    { name: 'Summary', slug: 'summary' },
                ]
            },
            { name: 'Trigonometry', slug: 'trigonometry' },
            { name: 'Sequence, Series, Limit', slug: 'sequence-series-limit' },
            { name: 'Linear Algebra', slug: 'linear-algebra' },
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
            { name: 'Rate Limit', slug: 'rate-limit' },
            { name: 'Distributed Task Scheduler', slug: 'distributed-task-scheduler' },
            { name: 'Distributed Cache', slug: 'distributed-cache' },
        ]
    },
    {
        name: 'AI',
        slug: 'neural-network',
        pages: [
            { name: 'Keywords', slug: 'keywords' },
        ]
    },
    {
        name: 'Knowledge Graph',
        slug: 'knowledge-graph',
        standalone: true
    },
];

