'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GeistMono } from 'geist/font/mono';
import { Sparkles, FileText, MessageSquare, Command, Users } from 'lucide-react';
import { landingContent } from '@/config/landing-content';

export default function ManagementSection() {
  const shouldReduceMotion = useReducedMotion();

  const iconMap: Record<string, React.ReactNode> = {
    FileText: <FileText className="w-4 h-4" />,
    MessageSquare: <MessageSquare className="w-4 h-4" />,
    Command: <Command className="w-4 h-4" />,
  };

  return (
    <section className="py-32 px-6 border-b border-white/5" aria-labelledby="management-heading">
      <div className="max-w-7xl mx-auto">
        <h2 id="management-heading" className="sr-only">Brand management features</h2>

        {/* First row - Management and Growth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
          {/* Manage your brand */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-white text-3xl font-medium mb-4 tracking-tight">
                {landingContent.management.sections[0].title}
              </h3>
              <p className="text-sm max-w-sm leading-relaxed">
                {landingContent.management.sections[0].description}
              </p>
            </div>

            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -5 }}
              className="bg-[#0c0c0c] border border-white/8 rounded-xl p-6 shadow-2xl overflow-hidden"
            >
              <h4 className="text-white text-sm font-medium mb-6">Campaign Overview</h4>
              <div className="space-y-4">
                {landingContent.management.sections[0].cards.map((row, i) => (
                  <div key={i} className="flex items-center text-[11px] py-1 border-b border-white/5">
                    <span className="w-24 text-gray-500">{row.label}</span>
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-white/5 rounded border border-white/10 text-white">
                      {i === 0 ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" aria-hidden="true" />
                      ) : (
                        <Sparkles className="w-2.5 h-2.5 text-blue-400" aria-hidden="true" />
                      )}
                      {row.value}
                    </div>
                    <span className="ml-2 text-gray-600 px-1 border border-white/5 rounded">{row.sub}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Growth updates */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-white text-3xl font-medium mb-4 tracking-tight">
                {landingContent.management.sections[1].title}
              </h3>
              <p className="text-sm max-w-sm leading-relaxed">
                {landingContent.management.sections[1].description}
              </p>
            </div>

            <div className="relative h-[280px] flex items-center justify-center">
              {landingContent.management.sections[1].updates.map((card, i) => {
                const rotations = [-6, -3, 0];
                const zIndexes = [10, 20, 30];
                const opacities = [0.3, 0.6, 1];

                return (
                  <motion.div
                    key={i}
                    style={{ rotate: rotations[i], zIndex: zIndexes[i], opacity: opacities[i] }}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05, rotate: 0, zIndex: 50, opacity: 1 }}
                    className="absolute w-[80%] bg-[#111] border border-white/10 rounded-xl p-6 shadow-2xl transition-all cursor-pointer"
                  >
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase mb-3 text-${card.color}-400`}>
                      <div className={`w-2 h-2 rounded-full bg-current`} aria-hidden="true" /> {card.status}
                    </div>
                    <p className="text-white text-sm font-medium mb-4 tracking-tight">
                      Reach is increasing. We are ready to launch the next series.
                    </p>
                    <span className="text-[10px] text-gray-600">{card.date}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Second row - Ideate and Collaborate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h3 className="text-white text-4xl font-medium tracking-tight">
              {landingContent.management.sections[2].title}
            </h3>
            <div className="space-y-4" role="list">
              {landingContent.management.sections[2].features.map((item, i) => (
                <button
                  key={i}
                  className={`flex items-center gap-4 w-full text-left py-2 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${
                    item.active
                      ? 'bg-white/5 text-white border-l-2 border-green-500'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  role="listitem"
                >
                  {iconMap[item.icon]} <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#0c0c0c] border border-white/8 rounded-xl p-8 min-h-[400px] relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-8 opacity-40">
              <Users className="w-4 h-4" aria-hidden="true" /> <span className="text-xs">Series &rsaquo; Brand Launch</span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500" aria-hidden="true">
                  <Users className="w-4 h-4" />
                </div>
                <div className="relative">
                  <h4 className="text-white text-xl font-medium">
                    {landingContent.management.sections[2].collaboration.title}
                  </h4>
                  <div className="absolute -top-6 -right-8 bg-green-500 text-black text-[9px] px-1.5 py-0.5 rounded font-bold" aria-label="User: zoe">
                    zoe
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed">
                {landingContent.management.sections[2].collaboration.description.split('**').map((part, i) => (
                  i % 2 === 1 ? <span key={i} className="text-white">{part}</span> : part
                )).map((part, i) =>
                  typeof part === 'string' && part.includes('##')
                    ? part.split('##').map((subpart, j) => j % 2 === 1 ? <span key={`${i}-${j}`} className="text-white">{subpart}</span> : subpart)
                    : part
                )}
              </p>

              <div className="space-y-3 pt-4 opacity-20" aria-hidden="true">
                <div className="h-2 w-full bg-white/20 rounded" />
                <div className="h-2 w-3/4 bg-white/20 rounded" />
              </div>

              {!shouldReduceMotion && (
                <motion.div
                  animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute bottom-20 left-10 bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold"
                  aria-label="User: quinn"
                >
                  quinn
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
