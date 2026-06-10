export const WORKFLOW_TYPES = [
    { value: 'engenharia', label: 'Engenharia', icon: '🏗️' },
    { value: 'software',   label: 'Software / App', icon: '💻' },
    { value: 'generico',   label: 'Genérico', icon: '📁' },
];

export const WORKFLOW_PHASES = {
    engenharia: [
        'Estudo Preliminar',
        'Anteprojeto',
        'Projeto Executivo',
        'Compatibilização',
        'Entregue',
        'Revisões',
    ],
    software: [
        'Ideia',
        'Validação',
        'MVP',
        'Beta',
        'Produção',
        'Manutenção',
    ],
    generico: [],
};

export const ENGINEERING_DISCIPLINES = [
    'Estrutural',
    'Hidrossanitário',
    'Elétrico',
    'Arquitetônico',
    'Fundações',
    'HVAC',
    'Impermeabilização',
    'Outros',
];

export const DRAWING_STATUS = {
    em_elaboracao: { label: 'Em Elaboração', color: '#f59e0b' },
    emitida:       { label: 'Emitida',       color: '#22c55e' },
    revisada:      { label: 'Revisada',       color: '#3b82f6' },
};

export const WORKFLOW_TYPE_ICON = {
    engenharia: '🏗️',
    software:   '💻',
    generico:   '📁',
};
