import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SKILLS, TECH_TAGS, PROJECTS, TYPEWRITER_TEXTS, SESSIONS } from "../data/portfolioData";
import { useInView } from "../hooks/useInView";
import "../styles/portfolio.css";

const SESSIONS_STORAGE_KEY = "portfolio.sessions";

const NAV_ITEMS = [
  { label: "Inicio", path: "/" },
  { label: "Sobre mi", path: "/sobre-mi" },
  { label: "Habilidades", path: "/habilidades" },
  { label: "Proyectos", path: "/proyectos" },
  { label: "Sesiones", path: "/sesiones" },
  { label: "Contacto", path: "/contacto" },
];

const createSessionId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createEmptyTopicEntry = () => ({ topic: "", description: "" });

const normalizeTopicEntry = (entry) => {
  if (!entry) {
    return null;
  }

  if (typeof entry === "string") {
    const topic = entry.trim();
    return topic ? { topic, description: "" } : null;
  }

  if (typeof entry === "object") {
    const topic = (entry.topic || entry.title || "").trim();
    const description = (entry.description || entry.summary || "").trim();
    if (!topic && !description) {
      return null;
    }
    return { topic, description };
  }

  return null;
};

const getSessionTopics = (session) => {
  if (Array.isArray(session.topics)) {
    const normalized = session.topics
      .map(normalizeTopicEntry)
      .filter(Boolean);

    if (normalized.length) {
      return normalized;
    }
  }

  const fallback = normalizeTopicEntry({
    topic: session.topic || session.title || "",
    description: session.description || session.summary || "",
  });

  return fallback ? [fallback] : [createEmptyTopicEntry()];
};

const getPrimaryTopicLabel = (session) => {
  const firstTopic = session.topics.find((entry) => entry.topic);
  if (!firstTopic) {
    return "Sin tema";
  }
  if (session.topics.length <= 1) {
    return firstTopic.topic;
  }
  return `${firstTopic.topic} +${session.topics.length - 1}`;
};

const normalizeSession = (session) => ({
  id: session.id || createSessionId(),
  week: session.week || "",
  topics: getSessionTopics(session),
  images: Array.isArray(session.images) ? session.images : [],
});

const AnimatedBar = ({ level, color, delay }) => {
  const [width, setWidth] = useState(0);
  const [ref, inView] = useInView(0.2);

  useEffect(() => {
    if (inView) {
      setTimeout(() => setWidth(level), delay);
    }
  }, [inView, level, delay]);

  return (
    <div ref={ref} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 8, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${width}%`, background: color,
        borderRadius: 99, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: `0 0 12px ${color}88`
      }} />
    </div>
  );
};

const TypeWriter = ({ texts }) => {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [typing, setTyping] = useState(true);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const current = texts[idx];
    if (typing) {
      if (charIdx < current.length) {
        const t = setTimeout(() => {
          setDisplay(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        }, 70);
        return () => clearTimeout(t);
      }

      const t = setTimeout(() => setTyping(false), 1800);
      return () => clearTimeout(t);
    }

    if (charIdx > 0) {
      const t = setTimeout(() => {
        setDisplay(current.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      }, 40);
      return () => clearTimeout(t);
    }

    setIdx((i) => (i + 1) % texts.length);
    setTyping(true);
    return undefined;
  }, [charIdx, typing, idx, texts]);

  return (
    <span style={{ color: "#60A5FA" }}>
      {display}
      <span style={{ animation: "blink 1s step-end infinite", borderRight: "2px solid #60A5FA" }}>&nbsp;</span>
    </span>
  );
};

const FloatingParticle = ({ style }) => (
  <div style={{
    position: "absolute", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(96,165,250,0.3) 0%, transparent 70%)",
    animation: "float 6s ease-in-out infinite",
    pointerEvents: "none",
    ...style
  }} />
);

const SectionTitle = ({ children, subtitle }) => {
  const [ref, inView] = useInView();

  return (
    <div ref={ref} style={{
      textAlign: "center", marginBottom: "3rem",
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.7s ease"
    }}>
      <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, color: "#F1F5F9", margin: 0, fontFamily: "'Space Mono', monospace" }}>
        {children}
      </h2>
      {subtitle && <p style={{ color: "#94A3B8", marginTop: "0.5rem", fontSize: "1rem" }}>{subtitle}</p>}
      <div style={{ width: 60, height: 3, background: "linear-gradient(90deg, #3B82F6, #8B5CF6)", margin: "1rem auto 0", borderRadius: 99 }} />
    </div>
  );
};

export default function Portfolio() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const activePath = pathname === "" ? "/" : pathname;

  const [scrolled, setScrolled] = useState(false);
  const [sessionsMenuOpen, setSessionsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [sessions, setSessions] = useState(() => {
    try {
      const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (!storedSessions) {
        return SESSIONS.map(normalizeSession);
      }

      const parsedSessions = JSON.parse(storedSessions);
      return Array.isArray(parsedSessions) ? parsedSessions.map(normalizeSession) : SESSIONS.map(normalizeSession);
    } catch {
      return SESSIONS.map(normalizeSession);
    }
  });
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    week: "",
    topics: [createEmptyTopicEntry()],
    images: "",
  });

  const navRef = useRef(null);
  const sessionsMenuRef = useRef(null);
  const sessionRefs = useRef({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!sessionsMenuRef.current?.contains(event.target)) {
        setSessionsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sessionModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sessionModalOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // Keep app usable if storage writes fail.
    }
  }, [sessions]);

  useEffect(() => {
    if (pathname !== "/sesiones" || !location.hash) {
      return;
    }

    const targetId = location.hash.slice(1);
    const target = sessionRefs.current[targetId];
    if (!target) {
      return;
    }

    const navHeight = navRef.current?.offsetHeight ?? 0;
    const y = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;
    window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
    setSessionsMenuOpen(false);
  }, [pathname, location.hash, sessions]);

  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setFormData({ name: "", email: "", msg: "" });
  };

  const handleSessionFormChange = (field, value) => {
    setSessionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTopicFieldChange = (index, field, value) => {
    setSessionForm((prev) => ({
      ...prev,
      topics: prev.topics.map((entry, topicIndex) =>
        topicIndex === index ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const addTopicField = () => {
    setSessionForm((prev) => ({
      ...prev,
      topics: [...prev.topics, createEmptyTopicEntry()],
    }));
  };

  const removeTopicField = (index) => {
    setSessionForm((prev) => {
      if (prev.topics.length <= 1) {
        return prev;
      }

      return {
        ...prev,
        topics: prev.topics.filter((_, topicIndex) => topicIndex !== index),
      };
    });
  };

  const resetSessionForm = () => {
    setSessionForm({ week: "", topics: [createEmptyTopicEntry()], images: "" });
    setEditingSessionId(null);
  };

  const openCreateSessionModal = () => {
    resetSessionForm();
    setSessionModalOpen(true);
  };

  const openEditSessionModal = (session) => {
    setSessionForm({
      week: session.week,
      topics: session.topics.length ? session.topics : [createEmptyTopicEntry()],
      images: session.images.join(", "),
    });
    setEditingSessionId(session.id);
    setSessionModalOpen(true);
  };

  const handleDeleteSession = (sessionId) => {
    const shouldDelete = window.confirm("¿Seguro que deseas eliminar esta sesión?");
    if (!shouldDelete) {
      return;
    }

    setSessions((prev) => prev.filter((session) => session.id !== sessionId));

    if (editingSessionId === sessionId) {
      setSessionModalOpen(false);
      resetSessionForm();
    }
  };

  const handleSessionSubmit = (e) => {
    e.preventDefault();

    const topics = sessionForm.topics
      .map((entry) => ({
        topic: entry.topic.trim(),
        description: entry.description.trim(),
      }))
      .filter((entry) => entry.topic || entry.description);

    if (!topics.length) {
      window.alert("Agrega al menos un tema para registrar la sesión.");
      return;
    }

    const images = sessionForm.images
      .split(",")
      .map((image) => image.trim())
      .filter(Boolean);

    const builtSession = {
      id: editingSessionId || createSessionId(),
      week: sessionForm.week.trim(),
      topics,
      images,
    };

    setSessions((prev) => {
      if (!editingSessionId) {
        return [builtSession, ...prev];
      }

      return prev.map((session) =>
        session.id === editingSessionId ? builtSession : session
      );
    });

    resetSessionForm();
    setSessionModalOpen(false);
  };

  return (
    <>
      <nav ref={navRef} style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(6,11,24,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
        transition: "all 0.4s ease", padding: "0.85rem 0"
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "1.1rem", color: "#60A5FA", fontWeight: 700 }}>
            &lt;RMG /&gt;
          </span>

          <div style={{ display: "flex", gap: "0.25rem" }} className="desktop-nav">
            {NAV_ITEMS.map((item) => (
              item.label === "Sesiones" ? (
                <div key={item.path} className="sessions-nav-wrapper" ref={sessionsMenuRef}>
                  <span
                    className={`nav-link ${activePath === item.path ? "active" : ""}`}
                    onClick={() => {
                      navigate(item.path);
                      setSessionsMenuOpen((prev) => !prev);
                    }}
                  >
                    {item.label}
                    <span className="sessions-caret">▾</span>
                  </span>

                  {sessionsMenuOpen && (
                    <div
                      className="sessions-nav-dropdown"
                      onMouseLeave={() => setSessionsMenuOpen(false)}
                    >
                      {sessions.length ? (
                        sessions.map((session) => (
                          <button
                            key={session.id}
                            type="button"
                            className="sessions-nav-item"
                            onClick={() => navigate(`/sesiones#${session.id}`)}
                          >
                            <span>{session.week}</span>
                            <small>{getPrimaryTopicLabel(session)}</small>
                          </button>
                        ))
                      ) : (
                        <p className="sessions-nav-empty">No hay semanas registradas.</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.path} className={`nav-link ${activePath === item.path ? "active" : ""}`} to={item.path}>
                  {item.label}
                </Link>
              )
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }} onClick={() => navigate("/contacto")}>
              Contáctame
            </button>
            {pathname === "/sesiones" && (
              <button
                type="button"
                className="session-icon-btn"
                onClick={openCreateSessionModal}
                aria-label="Agregar sesión"
                title="Agregar sesión"
              >
                +
              </button>
            )}
          </div>
        </div>
      </nav>

      {pathname === "/sesiones" && sessionModalOpen && (
        <div className="session-modal-overlay" onClick={() => { setSessionModalOpen(false); resetSessionForm(); }}>
          <aside className="session-modal" onClick={(e) => e.stopPropagation()}>
            <div className="session-modal-header">
              <div>
                <h3>{editingSessionId ? "Editar sesión semanal" : "Agregar sesión semanal"}</h3>
                <p>{editingSessionId ? "Actualiza la información y guarda los cambios." : "Completa la información para mostrarla en el módulo de sesiones."}</p>
              </div>
              <button
                type="button"
                className="session-modal-close"
                onClick={() => { setSessionModalOpen(false); resetSessionForm(); }}
                aria-label="Cerrar modal"
              >
                x
              </button>
            </div>

            <form onSubmit={handleSessionSubmit} className="session-form">
              <div>
                <label>Semana</label>
                <input
                  className="form-input"
                  placeholder="Ej: Semana 4"
                  value={sessionForm.week}
                  onChange={(e) => handleSessionFormChange("week", e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Temas de la semana</label>
                <div className="session-topics-form">
                  {sessionForm.topics.map((entry, index) => (
                    <div key={`topic-field-${index}`} className="session-topic-form-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.55rem" }}>
                        <span style={{ color: "#93C5FD", fontSize: "0.78rem", fontFamily: "'Space Mono', monospace" }}>
                          Tema {index + 1}
                        </span>
                        {sessionForm.topics.length > 1 && (
                          <button
                            type="button"
                            className="session-action-btn danger"
                            onClick={() => removeTopicField(index)}
                          >
                            Quitar
                          </button>
                        )}
                      </div>

                      <input
                        className="form-input"
                        placeholder="Ej: Introducción a React Hooks"
                        value={entry.topic}
                        onChange={(e) => handleTopicFieldChange(index, "topic", e.target.value)}
                        style={{ marginBottom: "0.6rem" }}
                        required={index === 0}
                      />
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="Describe qué aprendiste o desarrollaste en este tema..."
                        value={entry.description}
                        onChange={(e) => handleTopicFieldChange(index, "description", e.target.value)}
                        required={index === 0}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: "100%", justifyContent: "center", marginTop: "0.7rem" }}
                  onClick={addTopicField}
                >
                  + Agregar otro tema
                </button>
              </div>

              <div>
                <label>URLs de imágenes (separadas por coma)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="https://..., https://..."
                  value={sessionForm.images}
                  onChange={(e) => handleSessionFormChange("images", e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  {editingSessionId ? "Guardar cambios" : "Agregar sesión"}
                </button>
                {editingSessionId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => { resetSessionForm(); setSessionModalOpen(false); }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </aside>
        </div>
      )}

      {pathname === "/" && <HomeSection navigate={navigate} />}
      {pathname === "/sobre-mi" && <AboutSection />}
      {pathname === "/habilidades" && <SkillsSection />}
      {pathname === "/proyectos" && <ProjectsSection />}
      {pathname === "/sesiones" && (
        <SessionsSection
          sessions={sessions}
          onEdit={openEditSessionModal}
          onDelete={handleDeleteSession}
          registerRef={(sessionId, element) => {
            if (element) {
              sessionRefs.current[sessionId] = element;
            } else {
              delete sessionRefs.current[sessionId];
            }
          }}
        />
      )}
      {pathname === "/contacto" && (
        <ContactSection
          formData={formData}
          sent={sent}
          setFormData={setFormData}
          handleSend={handleSend}
        />
      )}

    </>
  );
}

function HomeSection({ navigate }) {
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.25,
        backgroundImage: "linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        animation: "gridMove 8s linear infinite"
      }} />
      <div style={{ position: "absolute", top: "10%", right: "15%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "10%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)", filter: "blur(30px)" }} />
      <FloatingParticle style={{ width: 80, height: 80, top: "20%", left: "5%", animationDelay: "0s" }} />
      <FloatingParticle style={{ width: 50, height: 50, top: "60%", right: "8%", animationDelay: "2s" }} />
      <FloatingParticle style={{ width: 35, height: 35, bottom: "20%", left: "30%", animationDelay: "4s" }} />

      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "3rem", alignItems: "center", paddingTop: "5rem" }}>
        <div style={{ animation: "fadeUp 0.9s ease forwards" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "0.4rem 1rem",
            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 99,
            color: "#93C5FD", fontSize: "0.85rem", marginBottom: "1.5rem"
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3B82F6", animation: "pulse-ring 2s ease-in-out infinite", display: "inline-block" }} />
            Disponible para proyectos
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 700, lineHeight: 1.1, fontFamily: "'Space Mono', monospace", marginBottom: "1rem", color: "#F1F5F9" }}>
            Hola, soy<br />
            <span style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Renzo Melgarejo G.
            </span><br />
            Estudiante de Ingeniería de Sistemas
          </h1>

          <div style={{ fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "#94A3B8", marginBottom: "2rem", minHeight: "2rem" }}>
            <TypeWriter texts={TYPEWRITER_TEXTS} />
          </div>

          <p style={{ color: "#64748B", lineHeight: 1.8, maxWidth: 520, marginBottom: "2.5rem", fontSize: "1rem" }}>
            Estudiante de Ingeniería de Sistemas en la Universidad Nacional del Centro del Perú, apasionado por construir soluciones tecnológicas que generen impacto real. Me especializo en desarrollo web, algoritmos y aprendizaje automático.
          </p>

          <div className="hero-btns" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => navigate("/proyectos")}>
              <span>Ver proyectos</span> <span>-&gt;</span>
            </button>
            <button className="btn-secondary" onClick={() => navigate("/contacto")}>
              <span>Descargar CV</span>
            </button>
          </div>
        </div>

        <div className="hero-image" style={{ position: "relative" }}>
          <div style={{
            width: 280, height: 280, borderRadius: "50%", position: "relative",
            background: "linear-gradient(135deg, #1E3A5F, #2D1B69)",
            border: "2px solid rgba(59,130,246,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "float 6s ease-in-out infinite"
          }}>
            <div style={{
              position: "absolute", inset: -12, borderRadius: "50%",
              border: "1.5px dashed rgba(59,130,246,0.3)",
              animation: "rotate 20s linear infinite"
            }} />
            <div style={{ fontSize: "6rem" }}>👨‍💻</div>
          </div>

          {[{ text: "Python", top: "0%", right: "-10%", color: "#3B82F6" },
            { text: "React", bottom: "15%", right: "-15%", color: "#06B6D4" },
            { text: "ML", top: "40%", left: "-20%", color: "#8B5CF6" }
          ].map((b) => (
            <div key={b.text} style={{
              position: "absolute", top: b.top, bottom: b.bottom, left: b.left, right: b.right,
              background: "rgba(15,23,42,0.9)", border: `1px solid ${b.color}55`,
              borderRadius: 10, padding: "0.4rem 0.75rem", fontSize: "0.8rem", color: b.color,
              fontFamily: "'Space Mono', monospace", fontWeight: 700,
              boxShadow: `0 4px 20px ${b.color}30`, animation: "float 4s ease-in-out infinite"
            }}>
              {b.text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "#334155", fontSize: "0.75rem" }}>
        <span style={{ fontFamily: "'Space Mono', monospace" }}>scroll</span>
        <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #334155, transparent)" }} />
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="section" style={{ paddingTop: "7.5rem" }}>
      <div className="container">
        <SectionTitle subtitle="Conoce un poco más sobre mí">Sobre mí</SectionTitle>
        <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <AboutText />
          <StatsPanel />
        </div>
      </div>
    </section>
  );
}

function SkillsSection() {
  return (
    <section className="section" style={{ paddingTop: "7.5rem", background: "rgba(255,255,255,0.01)" }}>
      <div className="container">
        <SectionTitle subtitle="Tecnologías y herramientas que manejo">Habilidades técnicas</SectionTitle>
        <div className="skills-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
          {SKILLS.map((s, i) => (
            <SkillBar key={s.name} skill={s} delay={i * 100} />
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#64748B", marginBottom: "1rem", fontSize: "0.9rem" }}>Otras áreas de conocimiento</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "center" }}>
            {TECH_TAGS.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section className="section" style={{ paddingTop: "7.5rem" }}>
      <div className="container">
        <SectionTitle subtitle="Lo que he construido hasta ahora">Proyectos destacados</SectionTitle>
        <div className="projects-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SessionsSection({ sessions, onEdit, onDelete, registerRef }) {
  return (
    <section className="section" style={{ paddingTop: "7.5rem", background: "rgba(255,255,255,0.01)" }}>
      <div className="container">
        <SectionTitle subtitle="Organiza avances, temas y evidencias por semana">Sesiones por semana</SectionTitle>
        <div className="sessions-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
          {sessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              registerRef={(element) => registerRef(session.id, element)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ formData, sent, setFormData, handleSend }) {
  return (
    <section className="section" style={{ paddingTop: "7.5rem", background: "rgba(255,255,255,0.01)" }}>
      <div className="container">
        <SectionTitle subtitle="¿Tienes un proyecto en mente? ¡Hablemos!">Contacto</SectionTitle>
        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "3rem" }}>
          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#F1F5F9", marginBottom: "0.75rem" }}>
              ¡Trabajemos juntos!
            </h3>
            <p style={{ color: "#64748B", lineHeight: 1.8, marginBottom: "2rem" }}>
              Estoy abierto a prácticas pre-profesionales, proyectos freelance y colaboraciones. No dudes en escribirme.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { icon: "📧", label: "Email", href: "mailto:renzo@email.com", text: "renzo@email.com" },
                { icon: "💼", label: "LinkedIn", href: "#", text: "linkedin.com/in/tu-perfil" },
                { icon: "🐙", label: "GitHub", href: "#", text: "github.com/tu-usuario" },
                { icon: "📍", label: "Ubicación", href: "#", text: "Lima, Perú" },
              ].map((s) => (
                <a key={s.label} href={s.href} className="social-btn">
                  <span style={{ fontSize: "1.1rem" }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontSize: "0.875rem" }}>{s.text}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#64748B", display: "block", marginBottom: "0.4rem" }}>Nombre</label>
                <input className="form-input" placeholder="Tu nombre" value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#64748B", display: "block", marginBottom: "0.4rem" }}>Email</label>
                <input className="form-input" type="email" placeholder="tu@email.com" value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#64748B", display: "block", marginBottom: "0.4rem" }}>Mensaje</label>
              <textarea className="form-input" rows={5} placeholder="Cuéntame sobre tu proyecto..." value={formData.msg}
                onChange={(e) => setFormData((p) => ({ ...p, msg: e.target.value }))} required
                style={{ resize: "vertical" }} />
            </div>
            <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
              {sent ? "Mensaje enviado" : "Enviar mensaje ->"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function SkillBar({ skill, delay }) {
  const [ref, inView] = useInView(0.2);

  return (
    <div ref={ref} className="skill-card" style={{
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: `all 0.6s ease ${delay}ms`
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#E2E8F0" }}>{skill.name}</span>
        <span style={{ fontSize: "0.8rem", color: skill.color, fontFamily: "'Space Mono', monospace" }}>{skill.level}%</span>
      </div>
      <AnimatedBar level={skill.level} color={skill.color} delay={delay + 200} />
    </div>
  );
}

function ProjectCard({ project, index }) {
  const [ref, inView] = useInView(0.1);
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref} className="project-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.6s ease ${index * 80}ms`,
        borderColor: hovered ? `${project.color}44` : "rgba(255,255,255,0.07)",
        boxShadow: hovered ? `0 20px 50px ${project.color}20` : "none"
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
          background: `${project.color}18`, fontSize: "1.5rem", border: `1px solid ${project.color}33`
        }}>
          {project.icon}
        </div>
        <span style={{ fontSize: "0.75rem", color: "#475569", fontFamily: "'Space Mono', monospace" }}>{project.year}</span>
      </div>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#F1F5F9", marginBottom: "0.6rem", fontFamily: "'Space Mono', monospace" }}>
        {project.title}
      </h3>
      <p style={{ color: "#64748B", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>
        {project.desc}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {project.tags.map((t) => (
          <span key={t} className="tag" style={{ borderColor: `${project.color}33`, color: project.color, background: `${project.color}10` }}>
            {t}
          </span>
        ))}
      </div>
      {hovered && (
        <div style={{
          marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex", gap: "0.75rem", animation: "slideIn 0.2s ease"
        }}>
          <a href={project.link} style={{ color: "#60A5FA", fontSize: "0.8rem", textDecoration: "none" }}>Ver código -&gt;</a>
          <a href={project.link} style={{ color: "#94A3B8", fontSize: "0.8rem", textDecoration: "none" }}>Demo live</a>
        </div>
      )}
    </div>
  );
}

function AboutText() {
  const [ref, inView] = useInView();

  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-30px)", transition: "all 0.8s ease" }}>
      <p style={{ color: "#94A3B8", lineHeight: 1.9, marginBottom: "1.25rem" }}>
        Soy Renzo Melgarejo G., estudiante de <strong style={{ color: "#60A5FA" }}>Ingeniería de Sistemas</strong> en la Universidad Nacional del Centro del Perú, cursando el 9no ciclo.
      </p>
      <p style={{ color: "#94A3B8", lineHeight: 1.9, marginBottom: "1.25rem" }}>
        Me apasiona resolver problemas complejos a través del código, desde el desarrollo de aplicaciones web completas hasta la implementación de modelos de machine learning. Creo firmemente en el poder de la tecnología para transformar la sociedad.
      </p>
      <p style={{ color: "#94A3B8", lineHeight: 1.9, marginBottom: "2rem" }}>
        Cuando no estoy programando, participo en competencias de programación competitiva (ICPC), contribuyo a proyectos open source y comparto contenido técnico en mis redes.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button className="btn-primary" style={{ fontSize: "0.875rem" }}>Descargar CV</button>
        <button className="btn-secondary" style={{ fontSize: "0.875rem" }}>Ver logros</button>
      </div>
    </div>
  );
}

function SessionCard({ session, index, onEdit, onDelete, registerRef }) {
  const [ref, inView] = useInView(0.15);
  const setCardRefs = (node) => {
    ref.current = node;
    registerRef?.(node);
  };

  return (
    <article
      ref={setCardRefs}
      className="session-card"
      style={{
        background: "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(10,16,35,0.95))",
        border: "1px solid rgba(59,130,246,0.15)",
        borderRadius: 20,
        overflow: "hidden",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `all 0.65s ease ${index * 90}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)";
        e.currentTarget.style.transform = inView ? "translateY(0)" : "translateY(24px)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.1rem 1.4rem",
        background: "rgba(59,130,246,0.06)",
        borderBottom: "1px solid rgba(59,130,246,0.12)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.3rem 0.85rem", borderRadius: 99,
            background: "rgba(59,130,246,0.18)",
            border: "1px solid rgba(59,130,246,0.35)",
            color: "#93C5FD", fontSize: "0.78rem", fontWeight: 600,
            fontFamily: "'Space Mono', monospace", letterSpacing: "0.03em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", display: "inline-block" }} />
            {session.week}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#475569", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            🖼 {session.images.length} imagen(es)
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            type="button"
            onClick={() => onEdit(session)}
            style={{
              padding: "0.3rem 0.75rem", borderRadius: 8, fontSize: "0.72rem", cursor: "pointer",
              border: "1px solid rgba(59,130,246,0.35)", background: "rgba(59,130,246,0.1)",
              color: "#93C5FD", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.22)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.6)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.35)"; }}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(session.id)}
            style={{
              padding: "0.3rem 0.75rem", borderRadius: 8, fontSize: "0.72rem", cursor: "pointer",
              border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
              color: "#FCA5A5", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
          >
            Eliminar
          </button>
        </div>
      </div>

      <div style={{ padding: "1.25rem 1.4rem" }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: "1.1rem", fontWeight: 700,
          color: "#F1F5F9", marginBottom: "1rem",
          display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          {session.week}
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(59,130,246,0.3), transparent)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
        {session.topics.map((entry, topicIndex) => (
          <div
            key={`${session.id}-topic-${topicIndex}`}
            style={{
              display: "flex", gap: "0.85rem", alignItems: "flex-start",
              padding: "0.75rem 1rem",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderLeft: "3px solid rgba(59,130,246,0.5)",
              borderRadius: 12,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59,130,246,0.06)";
              e.currentTarget.style.borderLeftColor = "#3B82F6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.025)";
              e.currentTarget.style.borderLeftColor = "rgba(59,130,246,0.5)";
            }}
          >
            <div style={{
              minWidth: 22, height: 22, borderRadius: 6, flexShrink: 0,
              background: "rgba(59,130,246,0.18)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#60A5FA", fontSize: "0.68rem", fontWeight: 700,
              fontFamily: "'Space Mono', monospace",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginTop: 1,
            }}>
              {String(topicIndex + 1).padStart(2, "0")}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{
                fontSize: "0.9rem", fontWeight: 600, color: "#DBEAFE",
                marginBottom: entry.description ? "0.25rem" : 0,
                fontFamily: "'Space Mono', monospace", lineHeight: 1.4,
              }}>
                {entry.topic || `Tema ${topicIndex + 1}`}
              </h4>
              {entry.description && (
                <p style={{ fontSize: "0.82rem", color: "#64748B", lineHeight: 1.65, margin: 0 }}>
                  {entry.description}
                </p>
              )}
            </div>
          </div>
        ))}
        </div>

        <div>
          <div style={{
            fontSize: "0.72rem", color: "#475569",
            fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase", letterSpacing: "0.08em",
            marginBottom: "0.6rem",
            display: "flex", alignItems: "center", gap: "0.4rem",
          }}>
            Evidencias
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          {session.images.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.7rem" }}>
              {session.images.map((imageUrl, imageIndex) => (
                <img
                  key={`${session.week}-${imageIndex}`}
                  src={imageUrl}
                  alt={`${getPrimaryTopicLabel(session)} - evidencia ${imageIndex + 1}`}
                  loading="lazy"
                  style={{
                    width: "100%", height: 190, objectFit: "cover",
                    borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.25s", display: "block",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.transform = "scale(1.01)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "scale(1)"; }}
                />
              ))}
            </div>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.85rem 1rem",
              border: "1px dashed rgba(100,116,139,0.3)",
              borderRadius: 10, color: "#475569", fontSize: "0.82rem",
            }}>
              🖼 Esta sesión no tiene imágenes aún.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function StatsPanel() {
  const [ref, inView] = useInView();
  const stats = [
    { val: "9no", label: "Ciclo", icon: "🎓" },
    { val: "17/20", label: "Promedio", icon: "⭐" },
    { val: "6+", label: "Proyectos", icon: "🚀" },
    { val: "3+", label: "Años codificando", icon: "💻" },
  ];

  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(30px)", transition: "all 0.8s ease 0.2s" }}>
      <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "1.5rem", textAlign: "center",
            transition: "all 0.3s", cursor: "default",
            animationDelay: `${i * 100}ms`
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = ""; }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#60A5FA", fontFamily: "'Space Mono', monospace", marginBottom: "0.25rem" }}>{s.val}</div>
            <div style={{ fontSize: "0.8rem", color: "#475569" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: "1rem", padding: "1.25rem 1.5rem",
        background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))",
        border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16
      }}>
        <p style={{ color: "#60A5FA", fontSize: "0.875rem", fontFamily: "'Space Mono', monospace", marginBottom: "0.25rem" }}>
          ICPC Latinoamérica 2023
        </p>
        <p style={{ color: "#64748B", fontSize: "0.8rem" }}>Clasificado en ronda regional con equipo UNCP-Alpha</p>
      </div>
    </div>
  );
}
