export const NAV_LINKS = ["Inicio", "Sobre mi", "Habilidades", "Proyectos", "Sesiones", "Contacto"];

export const SKILLS = [
  { name: "Python", level: 90, color: "#3B82F6" },
  { name: "JavaScript", level: 85, color: "#F59E0B" },
  { name: "React", level: 80, color: "#06B6D4" },
  { name: "Java", level: 75, color: "#EF4444" },
  { name: "SQL / PostgreSQL", level: 82, color: "#8B5CF6" },
  { name: "Node.js", level: 72, color: "#10B981" },
  { name: "Docker", level: 65, color: "#2563EB" },
  { name: "Git / GitHub", level: 88, color: "#EC4899" },
];

export const TECH_TAGS = [
  "Algoritmos",
  "Redes",
  "Sistemas Operativos",
  "Bases de Datos",
  "APIs REST",
  "Cloud AWS",
  "Linux",
  "Scrum",
  "Machine Learning",
  "Ciberseguridad",
];

export const PROJECTS = [
  {
    title: "SistemaBiblioteca",
    desc: "Sistema de gestion bibliotecaria con modulos de prestamo, inventario y reportes. Construido con Spring Boot y PostgreSQL.",
    tags: ["Java", "Spring Boot", "PostgreSQL", "REST API"],
    color: "#3B82F6",
    icon: "📚",
    year: "2024",
    link: "#",
  },
  {
    title: "AlgViz",
    desc: "Visualizador interactivo de algoritmos de ordenamiento y busqueda con animaciones en tiempo real.",
    tags: ["React", "D3.js", "JavaScript", "CSS Animations"],
    color: "#10B981",
    icon: "🔬",
    year: "2024",
    link: "#",
  },
  {
    title: "NetMonitor",
    desc: "Dashboard de monitoreo de red que analiza trafico, detecta anomalias y genera alertas en tiempo real.",
    tags: ["Python", "Scapy", "Flask", "React", "WebSocket"],
    color: "#8B5CF6",
    icon: "📡",
    year: "2023",
    link: "#",
  },
  {
    title: "EduChat AI",
    desc: "Chatbot educativo con NLP para responder preguntas sobre matematicas e ingenieria usando modelos de lenguaje.",
    tags: ["Python", "FastAPI", "OpenAI API", "React", "Docker"],
    color: "#F59E0B",
    icon: "🤖",
    year: "2023",
    link: "#",
  },
  {
    title: "CryptoTracker",
    desc: "Aplicacion de seguimiento de criptomonedas con predicciones basadas en LSTM y visualizacion de datos.",
    tags: ["Python", "TensorFlow", "Pandas", "Chart.js"],
    color: "#EF4444",
    icon: "📈",
    year: "2023",
    link: "#",
  },
  {
    title: "DevShell",
    desc: "Interprete de comandos personalizado en C con pipes, redireccion, historial y scripting basico.",
    tags: ["C", "Linux", "Shell", "Sistemas Operativos"],
    color: "#EC4899",
    icon: "⚡",
    year: "2022",
    link: "#",
  },
];

export const TYPEWRITER_TEXTS = [
  "Estudiante de Ing. de Sistemas",
  "Desarrollador Full Stack",
  "Apasionado por la IA & ML",
  "Problem Solver 💡",
];

export const SESSIONS = [
  {
    week: "Semana 1",
    topics: [
      {
        topic: "Fundamentos de las Tecnologías Web",
        description: "Las tecnologías web permiten crear aplicaciones y servicios accesibles mediante internet usando navegadores web. Facilitan la comunicación entre clientes y servidores para compartir información de manera rápida y segura.",
      },
      {
        topic: "Soluciones Web",
        description: "Las soluciones web resuelven necesidades concretas mediante sistemas, aplicaciones y plataformas accesibles en línea.",
      },
      {
        topic: "Sistema Web, Aplicación Web, Sitio Web y Página Web",
        description: "Un sistema web integra componentes conectados por internet; una aplicación web funciona en el navegador; un sitio web agrupa páginas relacionadas; y una página web es un documento individual dentro de un sitio.",
      },
      {
        topic: "Tecnologías Web Básicas",
        description: "HTML estructura el contenido, CSS define la apariencia visual y JavaScript agrega interactividad y dinamismo a las páginas web.",
      },
      {
        topic: "Lenguajes y Tecnologías Complementarias",
        description: "PHP se usa para backend, Python para desarrollo web y procesamiento de datos, SQL para bases de datos, XML para intercambio y almacenamiento de información, y JSON como formato ligero de datos.",
      },
      {
        topic: "Tecnologías Gráficas Web",
        description: "SVG permite imágenes vectoriales escalables sin pérdida de calidad, mientras que WebGL habilita gráficos 2D y 3D acelerados por hardware dentro del navegador.",
      },
      {
        topic: "Funcionamiento de la Web",
        description: "DNS traduce nombres de dominio en direcciones IP, TCP/IP permite la comunicación entre dispositivos y HTTP/HTTPS transfieren información entre navegadores y servidores; HTTPS añade cifrado SSL/TLS.",
      },
      {
        topic: "Roles en el Desarrollo de Aplicaciones para Internet",
        description: "El desarrollador frontend se encarga de la parte visual e interactiva, el backend gestiona la lógica del servidor y el fullstack combina ambas áreas para crear aplicaciones completas.",
      },
      {
        topic: "Exposición del sílabo",
        description: "Presentación general del contenido, la organización del curso y el alcance de los temas que se trabajarán durante las sesiones.",
      },
    ],
    images: [
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    week: "Semana 2",
    topics: [
      {
        topic: "Práctica guiada",
        description: "Desarrollo de ejercicios prácticos con acompañamiento en laboratorio.",
      },
      {
        topic: "Retroalimentación",
        description: "Revisión de avances, resolución de dudas y mejora de buenas prácticas.",
      },
    ],
    images: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    week: "Semana 3",
    topics: [
      {
        topic: "Diseño de solución",
        description: "Planteamiento de arquitectura y definición de componentes del proyecto semanal.",
      },
      {
        topic: "Implementación inicial",
        description: "Construcción del primer entregable con documentación y presentación de resultados.",
      },
    ],
    images: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80",
    ],
  },
];
