import { useEffect, useMemo, useRef, useState } from 'react';
import { api, auth } from './lib/api';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Bot, Check,
  ChevronDown, Code2, Command, ExternalLink, Layers3, Menu, MessageCircle,
  MousePointer2, Plus, Send, ShieldCheck, Sparkles, X, Zap, Trash2, Star,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const OWNER_EMAIL = 'jamesdigitls@gmail.com';

type Project = {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  accent?: string;
  featured?: boolean;
  visits?: number;
};

const services = [
  { id: '01', icon: Code2, title: 'Web experiences', text: 'Sharp, responsive websites that make a strong first impression and guide people to action.', tags: ['Landing pages', 'Business sites', 'UI implementation'] },
  { id: '02', icon: Layers3, title: 'Full-stack systems', text: 'Useful interfaces connected to reliable backend logic, APIs, and data workflows.', tags: ['Frontend', 'Backend', 'API integration'] },
  { id: '03', icon: Bot, title: 'AI & automation', text: 'Less repetitive work. Smarter workflows. Practical automation built around real tasks.', tags: ['AI workflows', 'Integrations', 'Process automation'] },
  { id: '04', icon: Command, title: 'Digital operations', text: 'Reliable virtual assistance for research, organization, and the day-to-day work behind a business.', tags: ['Research', 'Admin support', 'Digital support'] },
];

const sampleProjects: Project[] = [
  { id: 'concept-web', title: 'Business web experience', url: '#contact', description: 'A clear, responsive digital home for a growing business.', tags: ['Web design', 'Frontend'], accent: '#3791ff', featured: true },
  { id: 'concept-ai', title: 'Workflow automation', url: '#contact', description: 'A concept for connecting repetitive tasks into one cleaner flow.', tags: ['AI', 'Automation'], accent: '#8a6cff' },
  { id: 'concept-app', title: 'Full-stack product interface', url: '#contact', description: 'A structured interface designed around a useful workflow.', tags: ['React', 'Full-stack'], accent: '#58d7b0' },
];

const faqs = [
  { q: 'What can you build?', a: 'James Digitals works across frontend, backend and full-stack development, business websites, AI automation, and virtual assistance.' },
  { q: 'Can we work remotely?', a: 'Yes. Requirements, progress updates, feedback, and delivery can be coordinated remotely with clear communication.' },
  { q: 'How is a project priced?', a: 'Pricing depends on the service, scope, complexity, and timeline. Use the project planner for a starting range, then send an inquiry for a tailored quote.' },
  { q: 'What happens after I send an inquiry?', a: 'Your email app opens with the project details prefilled. Send it to start the conversation and clarify the scope, timeline, and next steps.' },
];

function DigitalCore({ hostRef }: { hostRef: React.RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    let frame = 0;
    let observer: ResizeObserver | undefined;
    let disposed = false;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070c, 0.018);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 12);
    const core = new THREE.Group();
    scene.add(core);

    const shellMaterial = new THREE.MeshPhysicalMaterial({ color: 0x111a2b, metalness: 0.72, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.16, wireframe: false });
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(2.05, 2), shellMaterial);
    core.add(shell);
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.12, 1), new THREE.MeshBasicMaterial({ color: 0x3791ff, wireframe: true, transparent: true, opacity: 0.54 }));
    core.add(wire);
    const rings: THREE.Mesh[] = [];
    [2.75, 3.05, 3.35].forEach((radius, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, i === 1 ? 0.012 : 0.018, 8, 180),
        new THREE.MeshBasicMaterial({ color: i === 1 ? 0x83bdff : 0x2876ef, transparent: true, opacity: i === 1 ? 0.72 : 0.42 })
      );
      ring.rotation.set(0.6 + i * 0.47, 0.3 + i * 0.58, 0.2 + i * 0.36);
      core.add(ring);
      rings.push(ring);
    });
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x9bcaff });
    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const node = new THREE.Mesh(new THREE.SphereGeometry(i % 3 === 0 ? 0.055 : 0.028, 10, 10), nodeMaterial);
      node.position.set(Math.cos(angle) * (2.5 + (i % 4) * 0.19), Math.sin(angle * 1.4) * 2.35, Math.sin(angle) * 1.5);
      core.add(node);
      nodes.push(node);
    }
    const starPositions = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 22;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x6685b5, size: 0.018, transparent: true, opacity: 0.7 }));
    scene.add(stars);
    scene.add(new THREE.AmbientLight(0x8daeff, 1.6));
    const keyLight = new THREE.PointLight(0x398bff, 42, 22);
    keyLight.position.set(4, 3, 6);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x7656ff, 22, 18);
    rimLight.position.set(-4, -2, -1);
    scene.add(rimLight);

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      host.dataset.fallback = 'true';
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.35 : 1.8));
    renderer.setClearColor(0x000001, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);

    const resize = () => {
      if (!renderer || disposed) return;
      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 700 ? 14 : 12;
      camera.updateProjectionMatrix();
    };
    observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.to(core.rotation, { y: Math.PI * 2, x: 0.42, ease: 'none', scrollTrigger: { trigger: '#services', start: 'top bottom', end: 'bottom top', scrub: 1 } });
        gsap.to(core.position, { x: -1.15, y: 0.15, ease: 'none', scrollTrigger: { trigger: '#work', start: 'top bottom', end: 'bottom top', scrub: 1 } });
        gsap.to(core.scale, { x: 0.72, y: 0.72, z: 0.72, ease: 'none', scrollTrigger: { trigger: '#planner', start: 'top bottom', end: 'center center', scrub: 1 } });
        gsap.to(core.rotation, { z: 0.7, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'center center', scrub: 1 } });
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.fromTo(el, { autoAlpha: 0, y: 26, filter: 'blur(8px)' }, {
            autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
          });
        });
      } else {
        gsap.set('[data-reveal]', { autoAlpha: 1, y: 0, filter: 'none' });
      }
    }, host);
    const start = performance.now();
    const render = () => {
      if (disposed) return;
      frame = requestAnimationFrame(render);
      const t = (performance.now() - start) / 1000;
      if (!reduced) {
        core.rotation.y += 0.0018;
        core.rotation.x = Math.sin(t * 0.28) * 0.11;
        rings.forEach((ring, i) => { ring.rotation.z += (i % 2 ? -1 : 1) * 0.0007; });
        nodes.forEach((node, i) => { node.position.z += Math.sin(t + i) * 0.0007; });
      }
      stars.rotation.y = t * 0.006;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      ctx.revert();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
    };
  }, [hostRef]);

  return <div className="core-canvas" ref={hostRef} aria-hidden="true" />;
}

function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [service, setService] = useState('Business website');
  const [pages, setPages] = useState('5');
  const [complexity, setComplexity] = useState('Standard');
  const [form, setForm] = useState({ name: '', email: '', details: '' });
  const [submitted, setSubmitted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMessage, setProjectMessage] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminBusy, setAdminBusy] = useState(false);
  const [projectDraft, setProjectDraft] = useState({ title: '', url: '', description: '', tags: 'Web design, React', accent: '#3791ff', featured: false });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hi! I’m the James Digitals AI assistant. Ask me about services, projects, pricing, or how to get in touch.' }
  ]);

  async function sendChat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question || chatBusy) return;
    const nextMessages = [...chatMessages, { role: 'user' as const, content: question }];
    setChatMessages(nextMessages);
    setChatInput('');
    setChatError('');
    setChatBusy(true);
    try {
      const result = await api.post('/api/chat', { messages: nextMessages.slice(-10) });
      const reply = typeof result.data?.reply === 'string' ? result.data.reply : 'I could not prepare an answer. Please try again.';
      setChatMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch {
      setChatError('The assistant is temporarily unavailable. You can contact James directly on WhatsApp.');
    } finally {
      setChatBusy(false);
    }
  }

  async function loadProjects() {
    try {
      const result = await api.get('/api/projects');
      setProjects(result.data.projects || []);
    } catch {
      setProjectMessage('Live projects are temporarily unavailable. Showing selected concepts instead.');
    }
  }

  useEffect(() => {
    loadProjects();
    auth.getUser().then((user) => {
      if (user?.email?.trim().toLowerCase() === OWNER_EMAIL) setAdminUser(user);
    });
  }, []);

  const visibleProjects = useMemo(() => {
    const list = projects.length ? projects : sampleProjects;
    return list.filter((project) => filter === 'All' || (project.tags || []).some((tag) => tag.toLowerCase().includes(filter.toLowerCase())));
  }, [projects, filter]);

  const estimate = useMemo(() => {
    const base: Record<string, number> = {
      'Business website': 120000,
      'Landing page': 60000,
      'Full-stack application': 250000,
      'AI automation': 100000,
      'Virtual assistance': 50000,
    };
    const multiplier = complexity === 'Advanced' ? 2.1 : complexity === 'Simple' ? 0.75 : 1;
    const pageExtra = service === 'Business website' ? Math.max(0, Number(pages) - 3) * 15000 : 0;
    return Math.round(((base[service] + pageExtra) * multiplier) / 5000) * 5000;
  }, [service, pages, complexity]);
  const estimateLow = Math.round((estimate * 0.85) / 1000) * 1000;
  const estimateHigh = Math.round((estimate * 1.2) / 1000) * 1000;

  function discussEstimate() {
    setForm((current) => ({
      ...current,
      details: (current.details ? current.details + '\n\n' : '') +
        'Project planner selection:\nService: ' + service +
        '\nComplexity: ' + complexity +
        '\nEstimated range: ₦' + estimateLow.toLocaleString('en-NG') + ' – ₦' + estimateHigh.toLocaleString('en-NG')
    }));
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }

  function sendInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent('Project inquiry — James Digitals');
    const body = encodeURIComponent(
      'Name: ' + form.name + '\nEmail: ' + form.email +
      '\nService: ' + service + '\nComplexity: ' + complexity +
      '\nEstimated range: ₦' + estimateLow.toLocaleString('en-NG') + ' – ₦' + estimateHigh.toLocaleString('en-NG') +
      '\nProject details: ' + form.details
    );
    window.location.href = 'mailto:' + OWNER_EMAIL + '?subject=' + subject + '&body=' + body;
    setSubmitted(true);
  }

  async function ownerSignIn() {
    setAdminBusy(true);
    setProjectMessage('');
    try {
      const result = await auth.signIn({ email: OWNER_EMAIL });
      if (result.magicLinkSent) {
        setProjectMessage('A secure sign-in link has been requested for ' + OWNER_EMAIL + '. Check that inbox, open the link on this device, then tap Owner sign in again.');
        return;
      }
      if (result.user?.email?.trim().toLowerCase() !== OWNER_EMAIL) {
        await auth.signOut();
        throw new Error('This account is not on the owner allowlist.');
      }
      setAdminUser(result.user);
      setAdminOpen(true);
    } catch (error: any) {
      setProjectMessage(error?.message || 'Sign-in was cancelled or failed. Allow the sign-in popup and try again.');
    } finally {
      setAdminBusy(false);
    }
  }

  async function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^https?:\/\//i.test(projectDraft.url)) {
      setProjectMessage('Enter a full URL starting with https:// or http://.');
      return;
    }
    setAdminBusy(true);
    setProjectMessage('');
    try {
      await api.post('/api/projects', { ...projectDraft, tags: projectDraft.tags.split(',').map((tag) => tag.trim()).filter(Boolean) });
      setProjectDraft({ title: '', url: '', description: '', tags: 'Web design, React', accent: '#3791ff', featured: false });
      await loadProjects();
      setProjectMessage('Project published to the showcase.');
    } catch (error: any) {
      setProjectMessage(error?.response?.data?.error || 'Could not save the project. Confirm you are signed in as the owner.');
    } finally {
      setAdminBusy(false);
    }
  }

  async function deleteProject(project: Project) {
    if (!window.confirm('Remove this project from the public showcase?')) return;
    try {
      await api.delete('/api/projects/' + encodeURIComponent(project.id));
      await loadProjects();
      setProjectMessage('Project removed.');
    } catch {
      setProjectMessage('Only the authorized owner can manage showcase projects.');
    }
  }

  async function toggleFeatured(project: Project) {
    try {
      await api.put('/api/projects/' + encodeURIComponent(project.id), { ...project, featured: !project.featured });
      await loadProjects();
    } catch {
      setProjectMessage('Could not update this project.');
    }
  }

  return (
    <div className="site" ref={rootRef}>
      <DigitalCore hostRef={canvasRef} />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="site-header">
        <a href="#home" className="brand" aria-label="James Digitals home">
          <img className="brand-logo" src="/resources/james-digitals-logo.jpg" alt="James Digitals — Web & Tech Solutions" />
        </a>
        <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'} aria-label="Main navigation">
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
          <a href="#process" onClick={() => setMenuOpen(false)}>Process</a>
          <a href="#planner" onClick={() => setMenuOpen(false)}>Planner</a>
        </nav>
        <div className="header-actions">
          <a className="header-cta" href="#contact">Let's talk <ArrowUpRight size={15} /></a>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-topline"><span className="live-dot" /> AVAILABLE FOR SELECT PROJECTS <span className="topline-rule" /> NIGERIA · REMOTE WORLDWIDE</div>
          <div className="hero-layout">
            <div className="hero-copy">
              <p className="kicker" data-reveal><span>01 / DIGITAL CRAFT</span> — SOFTWARE · AI · AUTOMATION</p>
              <h1 className="hero-title"><span>Ideas into</span><span className="title-accent">digital impact<span className="title-period">.</span></span></h1>
              <p className="hero-lede" data-reveal>I design and build useful digital experiences — from sharp websites and full-stack products to smarter automated workflows.</p>
              <div className="hero-actions" data-reveal>
                <a href="#contact" className="button-primary">Start a project <ArrowUpRight size={17} /></a>
                <a href="#work" className="button-ghost">Explore selected work <ArrowDownRight size={16} /></a>
              </div>
              <div className="hero-footnote" data-reveal><span className="footnote-icon"><ShieldCheck size={17} /></span><span><b>Built with intent.</b><small>Clear communication. Practical solutions. Reliable delivery.</small></span></div>
            </div>
            <div className="hero-visual" aria-label="Abstract three-dimensional digital core">
              <div className="visual-grid" />
              <div className="visual-cross cross-a">X: 001 / Y: 010</div>
              <div className="visual-cross cross-b">SYSTEM / ONLINE</div>
              <div className="visual-orbit-label"><span /> JMXI CORE <b>v.26</b></div>
              <div className="visual-index">FIG 001<br />DIGITAL SYSTEMS</div>
            </div>
          </div>
          <div className="hero-bottom"><span>SCROLL TO EXPLORE <ArrowDown size={13} /></span><span>DESIGNED FOR THE REAL WORLD <i>✳</i> BUILT TO SCALE</span></div>
        </section>

        <section className="marquee" aria-label="Capabilities"><div className="marquee-track"><span>WEB DEVELOPMENT <i>✳</i> FULL-STACK SYSTEMS <i>✳</i> AI AUTOMATION <i>✳</i> DIGITAL OPERATIONS <i>✳</i> WEB DEVELOPMENT <i>✳</i> FULL-STACK SYSTEMS <i>✳</i> AI AUTOMATION <i>✳</i> DIGITAL OPERATIONS <i>✳</i></span></div></section>

        <section className="section services-section" id="services">
          <div className="section-kicker" data-reveal><span>02 — WHAT I DO</span><span>CAPABILITIES / 04</span></div>
          <div className="section-intro" data-reveal><h2>Built for the<br /><em>next move.</em></h2><p>Not just digital decoration. Useful, well-considered work that helps people do more with less friction.</p></div>
          <div className="services-list">
            {services.map((item) => {
              const Icon = item.icon;
              return <article className="service-row" key={item.id} data-reveal>
                <span className="service-index">{item.id}</span>
                <span className="service-symbol"><Icon size={23} strokeWidth={1.5} /></span>
                <div className="service-main"><h3>{item.title}</h3><p>{item.text}</p><div className="service-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
                <a className="row-arrow" href="#contact" aria-label={'Discuss ' + item.title}><ArrowUpRight size={20} /></a>
              </article>;
            })}
          </div>
        </section>

        <section className="manifesto" id="process">
          <div className="manifesto-glow" />
          <div className="manifesto-inner">
            <div className="section-kicker" data-reveal><span>03 — THE APPROACH</span><span>LESS NOISE. MORE SIGNAL.</span></div>
            <h2 data-reveal>Make it clear.<br />Make it useful.<br /><span>Make it work.</span></h2>
            <div className="manifesto-bottom" data-reveal><span className="asterisk">*</span><p>Every build starts with the problem, not the trend. The goal is a digital product that feels considered, works reliably, and earns its place in your workflow.</p><a href="#contact" className="text-link">Work with me <ArrowUpRight size={16} /></a></div>
          </div>
        </section>

        <section className="section work-section" id="work">
          <div className="section-kicker" data-reveal><span>04 — SELECTED WORK</span><span>CONCEPTS / LIVE PROJECTS</span></div>
          <div className="section-intro work-intro" data-reveal><h2>Proof of<br /><em>possibility.</em></h2><p>Explore live projects and selected concepts. Each card is a starting point for building something that solves a real problem.</p></div>
          <div className="work-toolbar" data-reveal>
            <span>{projects.length ? 'LIVE SHOWCASE' : 'SELECTED CONCEPTS'} <span className="live-dot" /></span>
            <div className="filter-list" aria-label="Filter projects">
              {['All', 'Web', 'AI', 'React', 'Automation'].map((tag) => <button key={tag} className={filter === tag ? 'filter-chip active' : 'filter-chip'} onClick={() => setFilter(tag)}>{tag}</button>)}
            </div>
          </div>
          <div className="project-grid">
            {visibleProjects.map((project, index) => <article className="project-card" key={project.id} data-reveal style={{ '--project-accent': project.accent || '#3791ff' } as React.CSSProperties}>
              <div className="project-art">
                <div className="project-art-grid" />
                <div className={'project-window project-window-' + (index % 3)}>
                  <div className="project-window-top"><span /><span /><span /><small>{project.tags?.[0] || 'DIGITAL PROJECT'}</small></div>
                  <div className="project-window-content"><span className="project-art-kicker">JMXI / FIELD NOTES</span><b>{index === 0 ? 'Build a better' : index === 1 ? 'Automate the' : 'Make the complex'}<br /><em>{index === 0 ? 'first impression.' : index === 1 ? 'busy work.' : 'feel simple.'}</em></b><div className="project-art-lines"><i /><i /><i /></div></div>
                  <div className="project-art-stamp">{String(index + 1).padStart(2, '0')} / 03</div>
                </div>
                <span className="project-number">PROJECT / {String(index + 1).padStart(2, '0')}</span>
                <a href={project.url} onClick={(event) => { if (project.url === '#contact') { event.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); } }} target={project.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="project-open" aria-label={'Open ' + project.title}><ArrowUpRight size={19} /></a>
              </div>
              <div className="project-info"><div><span className="project-type">{(project.tags || []).slice(0, 2).join(' / ') || 'DIGITAL BUILD'}</span><h3>{project.title}</h3><p>{project.description}</p></div>{project.featured && <span className="featured-label"><Star size={12} /> FEATURED</span>}</div>
              <div className="project-card-foot"><span>{project.tags?.map((tag) => '#' + tag.replace(/\s+/g, '')).join('  ')}</span><a href={project.url} target={project.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{project.url.startsWith('http') ? 'View project' : 'Discuss a similar build'} <ArrowUpRight size={14} /></a></div>
            </article>)}
          </div>
          <div className="showcase-note" data-reveal><span><Sparkles size={16} /> HAVE A PROJECT TO FEATURE?</span><button onClick={ownerSignIn} disabled={adminBusy}>{adminBusy ? 'Connecting…' : 'Owner sign in'} <ArrowUpRight size={15} /></button></div>
          {projectMessage && <p className="project-message" role="status">{projectMessage}</p>}
        </section>

        <section className="planner-section" id="planner">
          <div className="planner-orb" />
          <div className="planner-inner">
            <div className="section-kicker" data-reveal><span>05 — PROJECT PLANNER</span><span>ESTIMATE / NGN</span></div>
            <div className="planner-layout">
              <div className="planner-copy" data-reveal><h2>Let's give<br />your idea<br /><em>a number.</em></h2><p>Choose a service, set the complexity, and get a rough starting range. Final pricing depends on the full scope and delivery timeline.</p><div className="planner-assurance"><Check size={15} /> No payment required to enquire</div></div>
              <div className="planner-panel" data-reveal>
                <div className="planner-panel-head"><span>ESTIMATE CONFIGURATOR</span><span className="live-dot" /></div>
                <label>01 / What are we building?<span className="select-wrap"><select value={service} onChange={(e) => setService(e.target.value)}><option>Business website</option><option>Landing page</option><option>Full-stack application</option><option>AI automation</option><option>Virtual assistance</option></select><ChevronDown size={15} /></span></label>
                {service === 'Business website' && <label>02 / Number of pages<span className="select-wrap"><select value={pages} onChange={(e) => setPages(e.target.value)}>{['1','2','3','4','5','6','7','8','9','10'].map((page) => <option key={page} value={page}>{page} {page === '1' ? 'page' : 'pages'}</option>)}</select><ChevronDown size={15} /></span></label>}
                <label>{service === 'Business website' ? '03' : '02'} / Complexity<span className="complexity-options">{['Simple', 'Standard', 'Advanced'].map((level) => <button key={level} className={complexity === level ? 'complexity-option active' : 'complexity-option'} onClick={() => setComplexity(level)}>{level}</button>)}</span></label>
                <div className="estimate-result"><span>ESTIMATED STARTING RANGE</span><strong>₦{estimateLow.toLocaleString('en-NG')} <i>—</i> ₦{estimateHigh.toLocaleString('en-NG')}</strong><small>Indicative only · Final quote after discovery</small></div>
                <button className="button-primary planner-submit" onClick={discussEstimate}>Discuss this estimate <ArrowUpRight size={16} /></button>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section section">
          <div className="section-kicker" data-reveal><span>06 — GOOD TO KNOW</span><span>QUESTIONS / ANSWERS</span></div>
          <div className="faq-layout"><h2 data-reveal>Before we<br /><em>get to work.</em></h2><div className="faq-list">{faqs.map((faq, index) => <article className={openFaq === index ? 'faq-item open' : 'faq-item'} key={faq.q} data-reveal><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>{String(index + 1).padStart(2, '0')}</span><b>{faq.q}</b><Plus size={18} /></button>{openFaq === index && <p>{faq.a}</p>}</article>)}</div></div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-glow" />
          <div className="contact-inner">
            <div className="section-kicker" data-reveal><span>07 — YOUR MOVE</span><span>INQUIRIES OPEN</span></div>
            <div className="contact-heading" data-reveal><h2>Have a good<br /><em>problem to solve?</em></h2><p>Tell me what you're trying to make possible. We'll work out the right next step.</p></div>
            <div className="contact-layout">
              <div className="contact-aside" data-reveal><span className="contact-symbol"><MessageCircle size={23} /></span><h3>Let's make something useful.</h3><p>Share the goal, the challenge, or the idea that's been sitting in your notes app.</p><a href={'mailto:' + OWNER_EMAIL}>{OWNER_EMAIL} <ArrowUpRight size={15} /></a><div className="contact-meta"><span><span className="live-dot" /> REMOTE-FIRST</span><span>UYO / NIGERIA · WORLDWIDE</span></div></div>
              <form className="contact-form" onSubmit={sendInquiry} data-reveal>
                <div className="form-row"><label>Your name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="How should I call you?" /></label><label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label></div>
                <label>What do you need?<span className="select-wrap"><select value={service} onChange={(e) => setService(e.target.value)}><option>Business website</option><option>Landing page</option><option>Full-stack application</option><option>AI automation</option><option>Virtual assistance</option></select><ChevronDown size={15} /></span></label>
                <label>Tell me about the project<textarea required rows={4} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="The goal, the must-haves, the deadline… anything useful." /></label>
                <button type="submit" className="button-primary send-button">{submitted ? 'Open email app again' : 'Send project inquiry'} <Send size={16} /></button>
                <small className="form-note">This opens your email app with your details prefilled. Nothing is sent until you press Send in your email app.</small>
              </form>
            </div>
          </div>
        </section>
      </main>

      {chatOpen && <section className="chatbot-panel" role="dialog" aria-label="James Digitals AI assistant"><div className="chatbot-head"><span className="chatbot-avatar"><Bot size={19} /></span><div><strong>James Digitals AI</strong><small><span className="live-dot" /> Ask about services & projects</small></div><button type="button" className="chatbot-close" onClick={() => setChatOpen(false)} aria-label="Close chatbot"><X size={18} /></button></div><div className="chatbot-messages" aria-live="polite">{chatMessages.map((message, index) => <div key={index} className={'chatbot-message ' + message.role}>{message.content}</div>)}{chatBusy && <div className="chatbot-message assistant chatbot-typing">Thinking…</div>}</div>{chatError && <p className="chatbot-error" role="status">{chatError} <a href="https://wa.me/2348153126056" target="_blank" rel="noopener noreferrer">Open WhatsApp</a></p>}<form className="chatbot-form" onSubmit={sendChat}><input aria-label="Ask James Digitals AI a question" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask about services, pricing…" maxLength={1200} disabled={chatBusy} /><button type="submit" aria-label="Send message" disabled={chatBusy || !chatInput.trim()}><Send size={17} /></button></form><p className="chatbot-disclaimer">AI answers may be imperfect. Confirm project details directly with James.</p></section>}
      <button type="button" className="chatbot-launcher" onClick={() => setChatOpen((open) => !open)} aria-expanded={chatOpen} aria-label={chatOpen ? 'Close AI assistant' : 'Open AI assistant'}><Bot size={22} /><span>Ask AI</span></button>
      <a className="whatsapp-float" href="https://wa.me/2348153126056?text=Hello%20James%20Digitals%2C%20I%27d%20like%20to%20discuss%20a%20project." target="_blank" rel="noopener noreferrer" aria-label="Chat with James Digitals on WhatsApp"><MessageCircle size={22} aria-hidden="true" /><span>WhatsApp</span></a>

      <footer className="site-footer"><a href="#home" className="brand footer-brand" aria-label="James Digitals home"><img className="brand-logo footer-logo" src="/resources/james-digitals-logo.jpg" alt="James Digitals — Web & Tech Solutions" /></a><span>© {new Date().getFullYear()} JAMES DIGITALS. BUILT WITH INTENT.</span><a href="#home" className="back-top">BACK TO TOP <ArrowUpRight size={14} /></a></footer>

      {adminOpen && <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setAdminOpen(false); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title"><div className="admin-head"><div><span>OWNER CONSOLE / PRIVATE</span><h2 id="admin-title">Manage showcase</h2><small>Signed in as {adminUser?.email || OWNER_EMAIL}</small></div><button onClick={() => setAdminOpen(false)} aria-label="Close owner console"><X size={20} /></button></div><form className="admin-form" onSubmit={saveProject}><label>Project title<input required value={projectDraft.title} onChange={(e) => setProjectDraft({ ...projectDraft, title: e.target.value })} /></label><label>Live URL<input required type="url" placeholder="https://…" value={projectDraft.url} onChange={(e) => setProjectDraft({ ...projectDraft, url: e.target.value })} /></label><label>Description<textarea required rows={2} value={projectDraft.description} onChange={(e) => setProjectDraft({ ...projectDraft, description: e.target.value })} /></label><label>Tags, comma-separated<input value={projectDraft.tags} onChange={(e) => setProjectDraft({ ...projectDraft, tags: e.target.value })} /></label><label>Accent colour<input type="color" value={projectDraft.accent} onChange={(e) => setProjectDraft({ ...projectDraft, accent: e.target.value })} /></label><label className="admin-check"><input type="checkbox" checked={projectDraft.featured} onChange={(e) => setProjectDraft({ ...projectDraft, featured: e.target.checked })} /> Feature this project</label><button className="button-primary" disabled={adminBusy}>{adminBusy ? 'Saving…' : 'Publish project'} <Plus size={15} /></button></form><div className="admin-projects"><h3>Published projects</h3>{projects.length ? projects.map((project) => <div className="admin-project" key={project.id}><div><b>{project.title}</b><small>{project.url}</small></div><button onClick={() => toggleFeatured(project)} aria-label={project.featured ? 'Unfeature ' + project.title : 'Feature ' + project.title}><Star size={16} fill={project.featured ? 'currentColor' : 'none'} /></button><button onClick={() => deleteProject(project)} aria-label={'Delete ' + project.title}><Trash2 size={16} /></button></div>) : <p>No live projects yet. Add one above to publish it.</p>}</div><button className="admin-signout" onClick={async () => { await auth.signOut(); setAdminUser(null); setAdminOpen(false); }}>Sign out</button></section></div>}
    </div>
  );
}

export default App;
