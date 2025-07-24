// Sistema de internacionalización para iRacing Setup Assistant

export const translations = {
  es: {
    // Header y navegación
    appTitle: 'iRacing Setup Assistant',
    searchSetups: '🔍 Buscar Setups',
    generator: '⚙️ Generador',
    favorites: '❤️ Favoritos',
    compare: '📊 Comparar',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    
    // Búsqueda
    advancedSearch: '🔍 Búsqueda Avanzada de Setups',
    allCars: 'Todos los coches',
    allTracks: 'Todos los circuitos',
    sessionType: 'Tipo de sesión',
    searchByName: 'Buscar por nombre...',
    search: 'Buscar',
    
    // Tipos de sesión
    qualifying: 'Qualifying',
    race: 'Race',
    rain: 'Rain',
    endurance: 'Endurance',
    
    // Setup card
    car: '🏎️ Coche',
    track: '🏁 Circuito',
    session: '📋 Sesión',
    style: '🎯 Estilo',
    generated: '🤖 Generado',
    generatedAt: '⏰ Generado',
    generatedSetup: 'Setup Generado',
    at: 'en',
    download: 'Descargar',
    favorite: 'Favorito',
    addFavorite: 'Agregar a Favoritos',
    selected: 'Seleccionado',
    favoriteSetups: 'Setups Favoritos',
    selectUpToCompare: 'Selecciona hasta 3 setups para comparar',
    rating: 'Rating',
    downloads: 'Descargas',
    
    // Estilos de setup
    safe: '🛡️ Seguro',
    balanced: '⚖️ Equilibrado',
    aggressive: '⚡ Agresivo',
    
    // Generator
    automaticGenerator: '⚙️ Generador Automático de Setups',
    automaticSetupGenerator: '⚙️ Generador Automático de Setups',
    selectCar: 'Selecciona un coche',
    selectTrack: 'Selecciona un circuito',
    safeConfig: '🛡️ Configuración Segura',
    safeConfiguration: '🛡️ Configuración Segura',
    balancedConfig: '⚖️ Configuración Equilibrada',
    balancedConfiguration: '⚖️ Configuración Equilibrada',
    aggressiveConfig: '⚡ Configuración Agresiva',
    aggressiveConfiguration: '⚡ Configuración Agresiva',
    generateSetup: 'Generar Setup Base',
    generateBaseSetup: 'Generar Setup Base',
    
    // Información del generador
    generatorInfo: 'ℹ️ Información del Generador',
    generatorInformation: 'ℹ️ Información del Generador',
    generatorDescription: 'El generador automático crea setups base optimizados según:',
    trackType: '🏁 Tipo de circuito (Oval, Road, Dirt)',
    trackTypeInfo: '🏁 Tipo de circuito (Oval, Road, Dirt)',
    trackCharacteristics: '📏 Características del track (longitud, curvas)',
    carCategory: '🏎️ Categoría del coche',
    sessionTypeInfo: '⏱️ Tipo de sesión',
    configStyle: '🎯 Estilo de configuración seleccionado',
    selectedConfigurationStyle: '🎯 Estilo de configuración seleccionado',
    
    // Estilos de configuración
    setupStyles: '🎯 Estilos de Configuración:',
    configurationStyles: '🎯 Estilos de Configuración',
    safeDescription: 'Configuración estable y predecible. Ideal para pilotos que buscan consistencia y facilidad de manejo. Menos propenso a errores.',
    balancedDescription: 'Balance perfecto entre rendimiento y estabilidad. Configuración versátil para la mayoría de situaciones.',
    aggressiveDescription: 'Máximo rendimiento en las manos adecuadas. Configuración más rápida pero requiere mayor habilidad y precisión.',
    
    // Detalles técnicos
    technicalDetails: '🔧 Ver Detalles Técnicos',
    hideTechnicalDetails: '🔧 Ocultar Detalles',
    completeTechnicalConfig: '📊 Configuración Técnica Completa',
    suspension: '🏎️ Suspensión',
    aerodynamics: '✈️ Aerodinámica',
    differential: '⚙️ Diferencial',
    brakes: '🛑 Frenos',
    tires: '🏁 Neumáticos',
    transmission: '🔧 Transmisión',
    
    // Componentes técnicos
    front: 'Delantero',
    rear: 'Trasero',
    spring: 'Muelle',
    damper: 'Amortiguador',
    antiRollBar: 'Barra anti-balanceo',
    frontWing: 'Alerón Delantero',
    rearWing: 'Alerón Trasero',
    frontSplitter: 'Splitter Delantero',
    preload: 'Precarga',
    power: 'Potencia',
    coast: 'Retención',
    balance: 'Balance',
    pressure: 'Presión',
    frontLeft: 'Presión Del. Izq.',
    frontRight: 'Presión Del. Der.',
    rearLeft: 'Presión Tras. Izq.',
    rearRight: 'Presión Tras. Der.',
    frontPressure: 'Presión Delantera',
    rearPressure: 'Presión Trasera',
    finalRatio: 'Relación Final',
    gears: 'Marchas',
    
    // Favoritos
    myFavorites: '❤️ Mis Setups Favoritos',
    
    // Comparador
    setupComparator: '📊 Comparador de Setups',
    selectUpTo4: 'Selecciona hasta 4 setups para comparar sus diferencias',
    compareSetups: 'Comparar Setups',
    
    // Autenticación
    loginTitle: 'Iniciar Sesión',
    registerTitle: 'Registrarse',
    username: 'Usuario',
    email: 'Email',
    password: 'Contraseña',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    register: 'Registrarse',
    credentialsError: 'Error en las credenciales',
    connectionError: 'Error de conexión',
    
    // Archivo de setup
    setupForIracing: '=== SETUP PARA iRACING ===',
    applicationInstructions: '=== INSTRUCCIONES DE APLICACIÓN ===',
    openIracing: '1. Abre iRacing y ve al Garage',
    selectCarInstruction: '2. Selecciona el coche',
    applyValues: '3. Aplica los siguientes valores:',
    importantNotes: '=== NOTAS IMPORTANTES ===',
    optimizedStartingPoint: '• Este setup es un punto de partida optimizado',
    adjustToStyle: '• Ajusta según tu estilo de conducción',
    practiceFirst: '• Practica antes de usar en carrera',
    fineAdjustments: '• Los valores pueden necesitar ajustes finos',
    styleCharacteristics: '=== CARACTERÍSTICAS DEL ESTILO',
    safeConfigFile: '🛡️ CONFIGURACIÓN SEGURA:',
    safeFeature1: '• Prioriza la estabilidad sobre la velocidad pura',
    safeFeature2: '• Ideal para pilotos que buscan consistencia',
    safeFeature3: '• Menos propenso a errores de pilotaje',
    safeFeature4: '• Perfecto para carreras largas',
    balancedConfigFile: '⚖️ CONFIGURACIÓN EQUILIBRADA:',
    balancedFeature1: '• Balance perfecto entre rendimiento y estabilidad',
    balancedFeature2: '• Versátil para diferentes condiciones',
    balancedFeature3: '• Buen punto de partida para ajustes personales',
    balancedFeature4: '• Adecuado para la mayoría de pilotos',
    aggressiveConfigFile: '⚡ CONFIGURACIÓN AGRESIVA:',
    aggressiveFeature1: '• Máximo rendimiento en las manos adecuadas',
    aggressiveFeature2: '• Requiere mayor habilidad y precisión',
    aggressiveFeature3: '• Ideal para qualifying y sprints',
    aggressiveFeature4: '• Puede ser inestable para pilotos novatos',
    generatedBy: '=== GENERADO POR iRacing Setup Assistant ===',
    visitRepo: 'Visita: https://github.com/tu-repo para más información',
    height: 'Altura',
    tirePressurePsi: 'Neumáticos (Presión en PSI)',
    
    // Idiomas
    language: 'Idioma',
    spanish: 'Español',
    english: 'English'
  },
  
  en: {
    // Header and navigation
    appTitle: 'iRacing Setup Assistant',
    searchSetups: '🔍 Search Setups',
    generator: '⚙️ Generator',
    favorites: '❤️ Favorites',
    compare: '📊 Compare',
    login: 'Login',
    logout: 'Logout',
    
    // Search
    advancedSearch: '🔍 Advanced Setup Search',
    allCars: 'All cars',
    allTracks: 'All tracks',
    sessionType: 'Session type',
    searchByName: 'Search by name...',
    search: 'Search',
    
    // Session types
    qualifying: 'Qualifying',
    race: 'Race',
    rain: 'Rain',
    endurance: 'Endurance',
    
    // Setup card
    car: '🏎️ Car',
    track: '🏁 Track',
    session: '📋 Session',
    style: '🎯 Style',
    generated: '🤖 Generated',
    generatedAt: '⏰ Generated',
    generatedSetup: 'Generated Setup',
    at: 'at',
    download: 'Download',
    favorite: 'Favorite',
    addFavorite: 'Add to Favorites',
    selected: 'Selected',
    favoriteSetups: 'Favorite Setups',
    selectUpToCompare: 'Select up to 3 setups to compare',
    rating: 'Rating',
    downloads: 'Downloads',
    
    // Setup styles
    safe: '🛡️ Safe',
    balanced: '⚖️ Balanced',
    aggressive: '⚡ Aggressive',
    
    // Generator
    automaticGenerator: '⚙️ Automatic Setup Generator',
    automaticSetupGenerator: '⚙️ Automatic Setup Generator',
    selectCar: 'Select a car',
    selectTrack: 'Select a track',
    safeConfig: '🛡️ Safe Configuration',
    safeConfiguration: '🛡️ Safe Configuration',
    balancedConfig: '⚖️ Balanced Configuration',
    balancedConfiguration: '⚖️ Balanced Configuration',
    aggressiveConfig: '⚡ Aggressive Configuration',
    aggressiveConfiguration: '⚡ Aggressive Configuration',
    generateSetup: 'Generate Base Setup',
    generateBaseSetup: 'Generate Base Setup',
    
    // Generator info
    generatorInfo: 'ℹ️ Generator Information',
    generatorInformation: 'ℹ️ Generator Information',
    generatorDescription: 'The automatic generator creates optimized base setups based on:',
    trackType: '🏁 Track type (Oval, Road, Dirt)',
    trackTypeInfo: '🏁 Track type (Oval, Road, Dirt)',
    trackCharacteristics: '📏 Track characteristics (length, corners)',
    carCategory: '🏎️ Car category',
    sessionTypeInfo: '⏱️ Session type',
    configStyle: '🎯 Selected configuration style',
    selectedConfigurationStyle: '🎯 Selected configuration style',
    
    // Configuration styles
    setupStyles: '🎯 Configuration Styles:',
    configurationStyles: '🎯 Configuration Styles',
    safeDescription: 'Stable and predictable configuration. Ideal for drivers seeking consistency and ease of handling. Less prone to errors.',
    balancedDescription: 'Perfect balance between performance and stability. Versatile configuration for most situations.',
    aggressiveDescription: 'Maximum performance in the right hands. Faster configuration but requires greater skill and precision.',
    
    // Technical details
    technicalDetails: '🔧 View Technical Details',
    hideTechnicalDetails: '🔧 Hide Details',
    completeTechnicalConfig: '📊 Complete Technical Configuration',
    suspension: '🏎️ Suspension',
    aerodynamics: '✈️ Aerodynamics',
    differential: '⚙️ Differential',
    brakes: '🛑 Brakes',
    tires: '🏁 Tires',
    transmission: '🔧 Transmission',
    
    // Technical components
    front: 'Front',
    rear: 'Rear',
    spring: 'Spring',
    damper: 'Damper',
    antiRollBar: 'Anti-roll bar',
    frontWing: 'Front Wing',
    rearWing: 'Rear Wing',
    frontSplitter: 'Front Splitter',
    preload: 'Preload',
    power: 'Power',
    coast: 'Coast',
    balance: 'Balance',
    pressure: 'Pressure',
    frontLeft: 'Front Left Pressure',
    frontRight: 'Front Right Pressure',
    rearLeft: 'Rear Left Pressure',
    rearRight: 'Rear Right Pressure',
    frontPressure: 'Front Pressure',
    rearPressure: 'Rear Pressure',
    finalRatio: 'Final Ratio',
    gears: 'Gears',
    
    // Favorites
    myFavorites: '❤️ My Favorite Setups',
    
    // Comparator
    setupComparator: '📊 Setup Comparator',
    selectUpTo4: 'Select up to 4 setups to compare their differences',
    compareSetups: 'Compare Setups',
    
    // Authentication
    loginTitle: 'Login',
    registerTitle: 'Register',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    register: 'Register',
    credentialsError: 'Credentials error',
    connectionError: 'Connection error',
    
    // Setup file
    setupForIracing: '=== SETUP FOR iRACING ===',
    applicationInstructions: '=== APPLICATION INSTRUCTIONS ===',
    openIracing: '1. Open iRacing and go to Garage',
    selectCarInstruction: '2. Select the car',
    applyValues: '3. Apply the following values:',
    importantNotes: '=== IMPORTANT NOTES ===',
    optimizedStartingPoint: '• This setup is an optimized starting point',
    adjustToStyle: '• Adjust according to your driving style',
    practiceFirst: '• Practice before using in race',
    fineAdjustments: '• Values may need fine adjustments',
    styleCharacteristics: '=== STYLE CHARACTERISTICS',
    safeConfigFile: '🛡️ SAFE CONFIGURATION:',
    safeFeature1: '• Prioritizes stability over pure speed',
    safeFeature2: '• Ideal for drivers seeking consistency',
    safeFeature3: '• Less prone to driving errors',
    safeFeature4: '• Perfect for long races',
    balancedConfigFile: '⚖️ BALANCED CONFIGURATION:',
    balancedFeature1: '• Perfect balance between performance and stability',
    balancedFeature2: '• Versatile for different conditions',
    balancedFeature3: '• Good starting point for personal adjustments',
    balancedFeature4: '• Suitable for most drivers',
    aggressiveConfigFile: '⚡ AGGRESSIVE CONFIGURATION:',
    aggressiveFeature1: '• Maximum performance in the right hands',
    aggressiveFeature2: '• Requires greater skill and precision',
    aggressiveFeature3: '• Ideal for qualifying and sprints',
    aggressiveFeature4: '• May be unstable for novice drivers',
    generatedBy: '=== GENERATED BY iRacing Setup Assistant ===',
    visitRepo: 'Visit: https://github.com/your-repo for more information',
    height: 'Height',
    tirePressurePsi: 'Tires (Pressure in PSI)',
    
    // Languages
    language: 'Language',
    spanish: 'Español',
    english: 'English'
  }
};

export const getTranslation = (language, key) => {
  return translations[language]?.[key] || translations['es'][key] || key;
};

export const formatTranslation = (language, key, ...args) => {
  const translation = getTranslation(language, key);
  return args.reduce((str, arg, index) => {
    return str.replace(`{${index}}`, arg);
  }, translation);
};