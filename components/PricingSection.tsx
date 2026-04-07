'use client';

import { motion } from 'framer-motion';
import { GeistMono } from 'geist/font/mono';
import { Check, Lock } from 'lucide-react';
import Link from 'next/link';
import { landingContent } from '@/config/landing-content';

export default function PricingSection() {
  return (
    <section className="py-32 px-6 border-b border-white/5" aria-labelledby="pricing-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className={`flex items-center justify-center gap-2 text-indigo-400 text-[10px] font-bold mb-6 uppercase tracking-[0.2em] ${GeistMono.className}`}>
            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" aria-hidden="true" />
            {landingContent.pricing.badge}
          </div>
          <h2 id="pricing-heading" className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
            {landingContent.pricing.title}
          </h2>
          <p className="text-[#8a8f98] text-lg max-w-2xl mx-auto">
            {landingContent.pricing.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {landingContent.pricing.plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className={`relative rounded-2xl border p-8 transition-all ${
                plan.comingSoon
                  ? 'bg-white/[0.01] border-white/5 opacity-60'
                  : plan.highlighted
                  ? 'bg-white/[0.03] border-white/20 shadow-[0_0_50px_rgba(99,102,241,0.15)] scale-105'
                  : 'bg-white/[0.01] border-white/8 hover:border-white/15'
              }`}
            >
              {plan.highlighted && !plan.comingSoon && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className={`bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${GeistMono.className}`}>
                    Most Popular
                  </span>
                </div>
              )}

              {plan.comingSoon && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className={`bg-white/10 border border-white/15 text-white/60 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${GeistMono.className}`}>
                    Coming Soon
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-white text-xl font-medium mb-2 tracking-tight">{plan.name}</h3>
                <p className="text-[#8a8f98] text-xs mb-6">{plan.description}</p>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-[#8a8f98] text-sm">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8" role="list">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-[#8a8f98]">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.comingSoon ? (
                <button
                  disabled
                  className="w-full h-11 rounded-lg text-sm font-medium bg-white/5 text-white/30 border border-white/8 cursor-not-allowed flex items-center justify-center gap-2"
                  aria-label="Enterprise plan — coming soon"
                >
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  Coming Soon
                </button>
              ) : (
                <Link href={plan.name === 'Free' ? '/auth/signup' : '/auth/signup'}>
                  <button
                    className={`w-full h-11 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${
                      plan.highlighted
                        ? 'bg-white text-black hover:bg-gray-200 shadow-lg'
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                    }`}
                    aria-label={`${plan.cta} - ${plan.name} plan`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-[#8a8f98] text-sm mb-8">
            {landingContent.pricing.disclaimer}
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-xs text-[#8a8f98]">
            {landingContent.pricing.links.map((link, idx) => (
              <button
                key={idx}
                className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
