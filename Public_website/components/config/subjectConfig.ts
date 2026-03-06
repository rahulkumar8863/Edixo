interface CustomField {
    name: string;
    type: 'select' | 'text' | 'checkbox';
    options?: string[];
}

interface SubjectConfig {
    hasDatePicker?: boolean;
    hasTimePicker?: boolean;
    topicCategories?: string[];
    topicTree?: Record<string, string[]>;
    customFields?: CustomField[];
    hasFormulaSelector?: boolean;
    hasDiagramOption?: boolean;
}

const subjectConfigs: Record<string, SubjectConfig> = {
    'Current Affairs': {
        hasDatePicker: true,
        hasTimePicker: true,
        topicCategories: [
            'National', 'International', 'Economy', 'Science & Tech',
            'Sports', 'Awards', 'Appointments', 'Defence', 'Environment'
        ],
    },
    'History': {
        topicTree: {
            'Ancient India': ['Indus Valley', 'Vedic Period', 'Mauryan Empire', 'Gupta Empire', 'South Indian Dynasties'],
            'Medieval India': ['Delhi Sultanate', 'Mughal Empire', 'Vijayanagara', 'Maratha Empire', 'Bhakti Movement'],
            'Modern India': ['British Rule', 'Freedom Movement', 'Social Reform', 'Post Independence'],
            'World History': ['Renaissance', 'French Revolution', 'Industrial Revolution', 'World Wars', 'Cold War'],
        },
    },
    'Geography': {
        topicTree: {
            'Physical Geography': ['Geomorphology', 'Climatology', 'Oceanography', 'Biogeography'],
            'Indian Geography': ['Physiography', 'Drainage', 'Climate', 'Soils', 'Natural Vegetation'],
            'World Geography': ['Continents', 'Countries', 'Resources', 'Population'],
            'Economic Geography': ['Agriculture', 'Industry', 'Trade', 'Transport'],
        },
        hasDiagramOption: true,
    },
    'Polity': {
        topicTree: {
            'Constitution': ['Preamble', 'Fundamental Rights', 'DPSP', 'Fundamental Duties', 'Amendments'],
            'Governance': ['Parliament', 'Executive', 'Judiciary', 'State Government', 'Local Government'],
            'Statutory Bodies': ['Election Commission', 'UPSC', 'Finance Commission', 'CAG', 'Attorney General'],
        },
    },
    'Economics': {
        topicTree: {
            'Microeconomics': ['Demand & Supply', 'Market Structure', 'Price Theory', 'Consumer Behavior'],
            'Macroeconomics': ['National Income', 'Money & Banking', 'Fiscal Policy', 'Monetary Policy'],
            'Indian Economy': ['Planning', 'Agriculture', 'Industry', 'Foreign Trade', 'Budget'],
        },
    },
    'Science': {
        topicTree: {
            'Physics': ['Mechanics', 'Thermodynamics', 'Optics', 'Electricity', 'Modern Physics'],
            'Chemistry': ['Organic', 'Inorganic', 'Physical Chemistry', 'Biochemistry'],
            'Biology': ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology', 'Plant Biology'],
        },
        hasFormulaSelector: true,
        hasDiagramOption: true,
    },
    'Mathematics': {
        topicTree: {
            'Arithmetic': ['Number System', 'Percentage', 'Ratio & Proportion', 'Profit & Loss', 'Time & Work'],
            'Algebra': ['Equations', 'Inequalities', 'Progressions', 'Polynomials'],
            'Geometry': ['Triangles', 'Circles', 'Mensuration', 'Coordinate Geometry'],
            'Statistics': ['Mean', 'Median', 'Mode', 'Probability', 'Data Interpretation'],
        },
        hasFormulaSelector: true,
        hasDiagramOption: true,
    },
    'English': {
        topicCategories: [
            'Grammar', 'Vocabulary', 'Comprehension', 'Cloze Test', 'Error Spotting', 'Sentence Improvement'
        ],
    },
    'Hindi': {
        topicCategories: [
            'व्याकरण', 'शब्द भंडार', 'अपठित गद्यांश', 'रिक्त स्थान', 'वाक्य शुद्धि'
        ],
    },
    'Reasoning': {
        topicCategories: [
            'Verbal Reasoning', 'Non-Verbal Reasoning', 'Logical Reasoning',
            'Analytical Reasoning', 'Data Sufficiency', 'Coding-Decoding',
            'Blood Relations', 'Direction Sense', 'Syllogism'
        ],
        hasDiagramOption: true,
    },
};

export function getSubjectConfig(subject: string): SubjectConfig {
    return subjectConfigs[subject] || {};
}
