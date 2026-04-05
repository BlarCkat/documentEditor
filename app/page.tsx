'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, cubicBezier, useReducedMotion } from 'framer-motion';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import {
  ChevronRight, Plus, BookOpen, Sparkles, Check,
  Terminal, Layout, BarChart2,
  FileText, MessageSquare, Command, Filter,
  ArrowUp, Clock, Code, GraduationCap, PenTool, Coffee
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { landingContent } from '@/config/landing-content';

// Lazy load heavy sections for better performance
const LazyPricingSection = dynamic(() => import('@/components/PricingSection'), {
  loading: () => <div className="py-32 px-6" aria-label="Loading pricing information">Loading...</div>,
});

const LazyManagementSection = dynamic(() => import('@/components/ManagementSection'), {
  loading: () => <div className="py-32 px-6" aria-label="Loading management features">Loading...</div>,
});

export default function EnfinotesLanding() {
  const [index, setIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [showMenu, setShowMenu] = useState<{ type: 'at' | 'slash' | 'cmd' | null }>({ type: null });
  const [menuSelectedIndex, setMenuSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const benefits = landingContent.hero.title.benefits;

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % benefits.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [benefits.length, shouldReduceMotion]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setMenuSelectedIndex(0);

    if (val.endsWith('@')) setShowMenu({ type: 'at' });
    else if (val.endsWith('/')) setShowMenu({ type: 'slash' });
    else if (val.toLowerCase().includes('create')) setShowMenu({ type: 'cmd' });
    else setShowMenu({ type: null });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showMenu.type) return;

    const menuOptions = showMenu.type === 'at'
      ? landingContent.ai.menu.at.options
      : showMenu.type === 'slash'
      ? landingContent.ai.menu.slash.options
      : [];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMenuSelectedIndex((prev) => (prev + 1) % menuOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMenuSelectedIndex((prev) => (prev - 1 + menuOptions.length) % menuOptions.length);
    } else if (e.key === 'Enter' && menuOptions.length > 0) {
      e.preventDefault();
      const selected = menuOptions[menuSelectedIndex];
      setInputValue(inputValue.slice(0, -1) + selected);
      setShowMenu({ type: null });
    } else if (e.key === 'Escape') {
      setShowMenu({ type: null });
    }
  };

  const getAnimationProps = (baseProps: any) => {
    if (shouldReduceMotion) {
      return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0 } };
    }
    return baseProps;
  };

  const blurFadeIn = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
    : {
        hidden: { opacity: 0, filter: 'blur(10px)', y: 10 },
        visible: {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          transition: { duration: 1.2, ease: cubicBezier(0.22, 1, 0.36, 1) }
        }
      };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion ? { duration: 0 } : { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  // Icon mapping helper
  const iconMap: Record<string, React.ReactNode> = {
    Terminal: <Terminal className="w-5 h-5 text-indigo-400" />,
    Layout: <Layout className="w-5 h-5 text-purple-400" />,
    BarChart2: <BarChart2 className="w-5 h-5 text-blue-400" />,
    PenTool: <PenTool className="w-3.5 h-3.5" />,
    GraduationCap: <GraduationCap className="w-3.5 h-3.5" />,
    Code: <Code className="w-3.5 h-3.5" />,
    Coffee: <Coffee className="w-3.5 h-3.5" />,
    FileText: <FileText className="w-4 h-4" />,
    MessageSquare: <MessageSquare className="w-4 h-4" />,
    Command: <Command className="w-4 h-4" />,
  };

  return (
    <div className={`${GeistSans.className} bg-black text-[#8a8f98] antialiased min-h-screen selection:bg-indigo-500/30 overflow-x-hidden`}>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/8 backdrop-blur-xl bg-black/50" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8 text-white">
            <Link href="/" className="flex items-center gap-2" aria-label="Enfinotes home">
              <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center" aria-hidden="true">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium tracking-tight">{landingContent.nav.brand}</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {landingContent.nav.links.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className={idx === 1
                  ? "bg-white text-black px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                  : "text-xs hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden border-b border-white/5 min-h-screen" aria-labelledby="hero-heading">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent blur-[120px]" />
        </div>

        <motion.div variants={container} initial="hidden" animate="visible" className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div variants={blurFadeIn}>
            <h1 id="hero-heading" className="text-5xl md:text-[88px] font-medium tracking-[-0.04em] leading-[1.05] text-white mb-8">
              {landingContent.hero.title.main} <br />
              <div className="relative h-[1.3em] flex justify-center items-center overflow-visible">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={index}
                    {...getAnimationProps({
                      initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
                      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
                      exit: { opacity: 0, y: -30, filter: 'blur(10px)' },
                      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                    })}
                    className="text-indigo-400 absolute whitespace-nowrap py-2"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {benefits[index]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </h1>
          </motion.div>
          <motion.p variants={blurFadeIn} className="text-lg md:text-xl text-[#8a8f98] max-w-2xl mx-auto mb-12 tracking-tight">
            {landingContent.hero.subtitle}
          </motion.p>

          {/* Interactive AI Chat Box */}
          <motion.div variants={blurFadeIn} className="max-w-2xl mx-auto mb-12 relative">
             <div className="relative flex flex-col bg-[#0c0c0c] border border-white/10 rounded-2xl p-5 shadow-2xl transition-all focus-within:border-white/20 text-left">
               <label htmlFor="chat-input" className="sr-only">Chat input</label>
               <input
                 ref={inputRef}
                 id="chat-input"
                 type="text"
                 value={inputValue}
                 onChange={handleInputChange}
                 onKeyDown={handleInputKeyDown}
                 placeholder={landingContent.hero.chatPlaceholder}
                 className="bg-transparent border-none outline-none text-base text-white w-full placeholder:text-gray-600 mb-10 px-1 focus:ring-0"
                 aria-describedby="chat-help"
                 aria-autocomplete="list"
                 aria-expanded={!!showMenu.type}
                 aria-controls={showMenu.type ? "chat-menu" : undefined}
               />
               <span id="chat-help" className="sr-only">
                 Type @ to mention an agent, / for quick actions, or the word create for commands. Use arrow keys to navigate suggestions.
               </span>

               <AnimatePresence>
                 {showMenu.type && (
                   <motion.div
                    id="chat-menu"
                    role="listbox"
                    aria-label={showMenu.type === 'at' ? 'Available agents' : showMenu.type === 'slash' ? 'Quick actions' : 'Commands'}
                    {...getAnimationProps({
                      initial: { opacity: 0, scale: 0.95, y: 10 },
                      animate: { opacity: 1, scale: 1, y: 0 },
                      exit: { opacity: 0, scale: 0.95, y: 10 }
                    })}
                    className="absolute bottom-[80px] left-6 w-56 bg-[#0c0c0c] border border-white/10 rounded-xl overflow-hidden z-50 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                   >
                     <div className={`p-3 border-b border-white/5 text-[9px] uppercase tracking-[0.15em] text-indigo-400 font-bold ${GeistMono.className}`}>
                       {showMenu.type === 'at' ? landingContent.ai.menu.at.title :
                        showMenu.type === 'slash' ? landingContent.ai.menu.slash.title :
                        landingContent.ai.menu.cmd.title}
                     </div>
                     <div className="p-1">
                        {showMenu.type === 'at' && landingContent.ai.menu.at.options.map((a, i) => (
                          <div
                            key={a}
                            role="option"
                            aria-selected={i === menuSelectedIndex}
                            className={`text-xs text-white p-2.5 rounded-lg cursor-pointer flex items-center gap-2 ${i === menuSelectedIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            onClick={() => {
                              setInputValue(inputValue.slice(0, -1) + a);
                              setShowMenu({ type: null });
                            }}
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" aria-hidden="true" /> {a}
                          </div>
                        ))}
                        {showMenu.type === 'slash' && landingContent.ai.menu.slash.options.map((a, i) => (
                          <div
                            key={a}
                            role="option"
                            aria-selected={i === menuSelectedIndex}
                            className={`text-xs text-white p-2.5 rounded-lg cursor-pointer flex items-center gap-2 ${i === menuSelectedIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            onClick={() => {
                              setInputValue(inputValue.slice(0, -1) + a);
                              setShowMenu({ type: null });
                            }}
                          >
                            <Command className="w-3 h-3 text-gray-500" aria-hidden="true" /> {a}
                          </div>
                        ))}
                        {showMenu.type === 'cmd' && (
                          <div className="text-xs text-indigo-400 p-2.5">{landingContent.ai.menu.cmd.message}</div>
                        )}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-5 text-gray-600">
                   <button
                     className="p-0 bg-transparent border-0 cursor-pointer transition-colors hover:text-white focus:outline-none focus:text-white"
                     aria-label="Attach file"
                   >
                     <Plus className="w-4.5 h-4.5" aria-hidden="true" />
                   </button>
                   <button
                     className="p-0 bg-transparent border-0 cursor-pointer transition-colors hover:text-white focus:outline-none focus:text-white"
                     aria-label="View history"
                   >
                     <Clock className="w-4.5 h-4.5" aria-hidden="true" />
                   </button>
                 </div>
                 <div className="flex items-center gap-4">
                    <button
                      className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer hover:text-white font-medium bg-transparent border-0 p-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0c0c0c] rounded"
                      aria-label="Change model - currently Sonnet 4.5"
                    >
                      Sonnet 4.5 <ChevronRight className="w-3 h-3 rotate-90" aria-hidden="true" />
                    </button>
                    <button
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0c0c0c]"
                      aria-label="Submit message"
                      disabled={!inputValue.trim()}
                    >
                      <ArrowUp className="w-4 h-4" aria-hidden="true" />
                    </button>
                 </div>
               </div>
             </div>

             <div className="flex flex-wrap justify-center gap-2.5 mt-6" role="group" aria-label="Quick action suggestions">
                {landingContent.hero.quickActions.map((btn, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(btn.label)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl border border-white/5 bg-[#0c0c0c] text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    aria-label={`Suggest: ${btn.label}`}
                  >
                    {iconMap[btn.icon]} {btn.label}
                  </button>
                ))}
             </div>
          </motion.div>

          <motion.div variants={blurFadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <button className="h-12 px-8 bg-[#f7f7f7] text-black hover:bg-white rounded-full text-sm font-medium transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
                {landingContent.hero.cta.primary}
              </button>
            </Link>
            <button className="group h-12 px-6 flex items-center gap-2 text-[#8a8f98] hover:text-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-full">
              <span className={GeistMono.className}>{landingContent.hero.cta.secondary}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 border-b border-white/5" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
            <h2 id="features-heading" className="text-4xl md:text-5xl font-medium tracking-tight text-white max-w-md">
              {landingContent.features.title}
            </h2>
            <p className="text-[#8a8f98] text-sm md:text-base max-w-md leading-relaxed">
              {landingContent.features.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
            {landingContent.features.items.map((feature, idx) => (
              <motion.div
                key={idx}
                role="listitem"
                {...getAnimationProps({
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { delay: idx * 0.1, duration: 0.8 }
                })}
                className="group relative h-[450px] rounded-2xl border border-white/8 bg-linear-to-b from-white/2 to-transparent p-8 flex flex-col justify-between hover:border-white/20 transition-all overflow-hidden"
              >
                <div className="flex-1 w-full flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                   <div className="relative w-32 h-32 border border-white/10 rounded-lg rotate-12 flex items-center justify-center">
                      <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 to-transparent" />
                      {iconMap[feature.icon]}
                   </div>
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium mb-2">{feature.title}</h3>
                  <div className="flex justify-between items-end">
                     <p className="text-[#8a8f98] text-sm max-w-[220px] leading-snug">
                       {feature.description}
                     </p>
                     <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#8a8f98] group-hover:text-white group-hover:border-white/30 transition-all" aria-hidden="true">
                        <Plus className="w-4 h-4" />
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-32 px-6 overflow-hidden border-b border-white/5" aria-labelledby="ai-heading">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl">
            <div className={`flex items-center gap-2 text-indigo-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em] ${GeistMono.className}`} aria-label="Section: Artificial Intelligence">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" aria-hidden="true" />
              {landingContent.ai.badge}
            </div>
            <h2 id="ai-heading" className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-[1.1]">
              {landingContent.ai.title}
            </h2>
            <p className="text-[#8a8f98] text-lg mb-8 leading-relaxed max-w-md">
              <span className="text-white font-medium">{landingContent.ai.description.highlight}</span> {landingContent.ai.description.text}
            </p>
            <button className="h-10 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-white text-xs font-medium transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
              {landingContent.ai.cta} <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-20 relative flex justify-center" aria-label="AI agents preview">
            <div
              style={{ transform: shouldReduceMotion ? 'none' : 'perspective(1200px) rotateX(15deg)' }}
              className="w-full max-w-2xl bg-[#0c0c0c] border border-white/8 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
            >
              <div className={`p-4 border-b border-white/5 bg-white/2 text-[11px] font-semibold text-gray-500 uppercase tracking-widest flex justify-between items-center ${GeistMono.className}`}>
                <span>Assign creative task...</span>
                <Sparkles className="w-3 h-3 text-indigo-400" aria-hidden="true" />
              </div>

              <div className="p-2 space-y-1 relative z-10" role="list" aria-label="Available AI agents">
                {landingContent.ai.agents.map((item, i) => (
                  <div
                    key={i}
                    role="listitem"
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${i === 0 ? 'bg-white/[0.07] text-white' : 'text-gray-500 hover:bg-white/3'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold border border-white/5 bg-${item.color}-500/10 text-${item.color}-400 ${GeistMono.className}`} aria-hidden="true">
                        {item.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium tracking-tight">{item.name}</span>
                        <span className={`text-[9px] uppercase tracking-tighter opacity-40 ${GeistMono.className}`}>{item.type}</span>
                      </div>
                    </div>
                    {i === 0 && <Check className="w-4 h-4 text-indigo-400" aria-label="Selected" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-10 left-0 right-0 h-40 bg-linear-to-t from-black via-black/80 to-transparent pointer-events-none z-20" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Content Planning Section - Optimized */}
      <section className="py-32 px-6 border-b border-white/5 overflow-hidden" aria-labelledby="planning-heading">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl mb-16">
            <div className={`flex items-center gap-2 text-green-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em] ${GeistMono.className}`} aria-label="Section: Campaign and roadmap planning">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]" aria-hidden="true" />
              {landingContent.planning.badge}
            </div>
            <h2 id="planning-heading" className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-[1.1]">
              {landingContent.planning.title}
            </h2>
            <p className="text-[#8a8f98] text-lg leading-relaxed max-w-md">
              <span className="text-white font-medium">{landingContent.planning.description.highlight}</span> {landingContent.planning.description.text}
            </p>
          </div>

          <div className="relative h-[300px] w-full mt-10">
            {/* Optimized timeline - using CSS grid instead of mapping 40 elements */}
            <div
              className="absolute top-0 w-full h-full pointer-events-none opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 20px)',
                backgroundSize: '20px 100%'
              }}
              aria-hidden="true"
            />

            <div className={`absolute top-0 w-full flex justify-between border-t border-white/10 pt-4 text-[10px] text-gray-600 ${GeistMono.className}`} aria-label="Timeline dates">
              <span>30</span><span>AUG 3</span><span>10</span><span>17</span>
              <span className="text-white bg-white/10 px-2 py-0.5 rounded" aria-current="date">AUG 22</span>
              <span>24</span><span>SEP</span>
            </div>

            <div className="pt-20 space-y-8 relative">
              {landingContent.planning.projects.map((project, idx) => (
                <motion.div
                  key={idx}
                  {...getAnimationProps({
                    initial: { opacity: 0, x: idx === 0 ? -50 : 50 },
                    whileInView: { opacity: 1, x: 0 }
                  })}
                  className={`relative h-8 ${idx === 0 ? 'w-[60%] ml-[10%]' : 'w-[45%] ml-[40%]'} bg-white/5 border border-white/10 rounded-full flex items-center px-4 group cursor-pointer hover:bg-white/10 transition-all`}
                  role="listitem"
                >
                  <div className={`${idx === 0 ? 'w-3 h-3 rotate-45 border border-white/20 mr-3 group-hover:bg-indigo-500 transition-colors' : 'flex -space-x-1 mr-3'}`} aria-hidden="true">
                    {idx === 1 && [1,2,3].map(i => <div key={i} className="w-3 h-3 rotate-45 bg-gray-600 border border-black" />)}
                  </div>
                  <span className="text-xs text-white font-medium">{project.name}</span>
                  <span className={`ml-auto text-[9px] text-gray-500 uppercase tracking-tighter ${GeistMono.className}`}>{project.status}</span>
                </motion.div>
              ))}

              {!shouldReduceMotion && (
                <motion.div
                  animate={{ x: [0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -top-20 left-[65%] h-[300px] w-px bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-0"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lazy loaded Management Section */}
      <LazyManagementSection />

      {/* Tracking Section */}
      <section className="py-32 px-6 border-b border-white/5" aria-labelledby="tracking-heading">
        <div className="max-w-7xl mx-auto">
          <h2 id="tracking-heading" className="sr-only">Tracking and management features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-white text-3xl font-medium mb-4 tracking-tight">{landingContent.tracking.schedule.title}</h3>
                <p className="text-sm max-w-sm leading-relaxed">{landingContent.tracking.schedule.description}</p>
              </div>

              <motion.div
                {...getAnimationProps({
                  initial: { opacity: 0 },
                  whileInView: { opacity: 1 }
                })}
                className="bg-[#0c0c0c] border border-white/8 rounded-xl p-6 shadow-2xl relative h-[300px] overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-white text-sm font-medium">Upcoming posts</span>
                  <span className="text-[10px] text-indigo-400 uppercase tracking-widest">Scheduled</span>
                </div>

                <div className="flex flex-col gap-3">
                  {landingContent.tracking.schedule.posts.map((post, i) => {
                    const platformColors: Record<string, string> = {
                      twitter: 'bg-sky-500',
                      linkedin: 'bg-blue-600',
                      instagram: 'bg-pink-500',
                    };
                    const platformLabels: Record<string, string> = {
                      twitter: 'X',
                      linkedin: 'in',
                      instagram: 'IG',
                    };
                    return (
                      <motion.div
                        key={i}
                        {...getAnimationProps({
                          initial: { opacity: 0, x: -10 },
                          whileInView: { opacity: 1, x: 0 },
                          transition: { delay: i * 0.1 }
                        })}
                        className="flex items-center gap-3 p-3 bg-white/3 border border-white/8 rounded-lg"
                      >
                        <div className={`w-6 h-6 rounded-md ${platformColors[post.platform]} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                          {platformLabels[post.platform]}
                        </div>
                        <p className="text-xs text-gray-300 flex-1 truncate">{post.preview}</p>
                        <span className="text-[9px] text-gray-600 whitespace-nowrap">{post.time}</span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-center gap-2 pt-3 border-t border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] text-gray-600">3 posts queued this week</span>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-white text-3xl font-medium mb-4 tracking-tight">{landingContent.tracking.triage.title}</h3>
                <p className="text-sm max-w-sm leading-relaxed">{landingContent.tracking.triage.description}</p>
              </div>

              <motion.div
                {...getAnimationProps({
                  whileHover: { y: -5 }
                })}
                className="bg-[#0c0c0c] border border-white/8 rounded-xl p-6 shadow-2xl min-h-[300px]"
              >
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Filter className="w-3 h-3" aria-hidden="true" /> Triage
                </div>
                <div className="space-y-3" role="list">
                  {landingContent.tracking.triage.items.map((item, i) => (
                    <div key={i} className="p-3 bg-white/3 border border-white/10 rounded-lg relative group" role="listitem">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-white font-medium">{item.title}</span>
                      </div>
                      <div className="absolute top-8 right-2 bg-[#111] border border-white/10 rounded shadow-xl p-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex items-center gap-2 text-[9px] text-gray-400 hover:text-white px-3 py-1.5 w-full text-left bg-transparent border-0 cursor-pointer focus:outline-none focus:bg-white/5 rounded">
                            <Check className="w-2.5 h-2.5" aria-hidden="true" /> {item.action}
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Lazy loaded Pricing Section */}
      <LazyPricingSection />

      {/* CTA Section */}
      <section className="py-32 px-6 border-b border-white/5 bg-black" aria-labelledby="cta-heading">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 text-center">
          <h2 id="cta-heading" className="text-3xl md:text-5xl font-medium tracking-tight text-white">
            {landingContent.cta.title}
          </h2>
          <div className="flex items-center gap-4">
            {landingContent.cta.buttons.map((btn, idx) => (
              <Link key={idx} href={btn.variant === 'primary' ? '/auth/signup' : '#'}>
                <button className={btn.variant === 'primary'
                  ? "h-12 px-6 bg-[#f7f7f7] text-black hover:bg-white rounded-lg text-sm font-medium transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                  : "h-12 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                }>
                  {btn.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 px-6" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="h-4 w-4 opacity-50" aria-hidden="true" />
            <span className={`text-xs font-semibold uppercase tracking-widest ${GeistMono.className}`}>{landingContent.footer.brand}</span>
          </div>
          <p className={`text-[10px] tracking-widest uppercase text-gray-700 ${GeistMono.className}`}>{landingContent.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
