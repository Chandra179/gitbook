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
        name: 'Topic Breakdown',
        slug: 'topic-breakdown',
        standalone: true
    },
    {
        name: 'General',
        slug: 'general',
        pages: [
            { name: 'API Design Guidelines', slug: 'api-design-guidelines' },
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
            { name: 'Template High Level Design', slug: 'template-high-level-design' }
        ]
    },
    // {
    //     name: 'Online Travel Agency',
    //     slug: 'online-travel-agency',
    //     standalone: true
    // },
    {
        name: 'Study & Project Group Matcher',
        slug: 'study-and-project-group-matcher',
        standalone: true
    },
    {
        name: 'SaaS Ideas',
        slug: 'saas-ideas',
        standalone: true
    },
];

