'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap, Users, Calendar, BarChart3, Shield, Globe, BookOpen } from 'lucide-react';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Enfinotes</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-sm text-gray-300 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/auth/signin" className="text-sm text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup">
                <button className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold rounded-full hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105">
                  Get Started
                </button>
              </Link>
            </div>

            <button className="md:hidden text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-20 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          />
          <div 
            className="absolute bottom-20 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-amber-400 mr-2" />
              <span className="text-sm text-gray-300">AI-Powered Content Studio</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none animate-slide-up">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-red-400">
                Write.
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-red-400 to-pink-500">
                Schedule.
              </span>
              <span className="block text-white">
                Dominate.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              The all-in-one content creation platform that transforms your ideas into viral posts across every social platform. AI-assisted writing, smart scheduling, and analytics that matter.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Link href="/auth/signup">
                <button className="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-full hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                  <span>Start Creating Free</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <Link href="#features">
                <button className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300">
                  See How It Works
                </button>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <span>✓ No credit card required</span>
              <span>✓ 3 pages free monthly</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
              
              {/* Mock UI */}
              <div className="relative p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-xs text-gray-500">
                    enfinotes.com/editor
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full" />
                      <div>
                        <div className="text-sm font-semibold">New Post</div>
                        <div className="text-xs text-gray-500">Draft</div>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-semibold rounded-full">
                      Publish
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="h-4 bg-white/20 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-5/6" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                  </div>

                  <div className="flex items-center space-x-2 mt-6">
                    <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">Twitter</div>
                    <div className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">LinkedIn</div>
                    <div className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs">Instagram</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl rotate-12 opacity-20 blur-xl animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl -rotate-12 opacity-20 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Professional-grade tools designed for creators who mean business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI Writing Assistant',
                description: 'Generate engaging content in seconds with our advanced AI that understands your voice and brand.',
                gradient: 'from-amber-400 to-orange-500'
              },
              {
                icon: Calendar,
                title: 'Smart Scheduling',
                description: 'Post at optimal times across all platforms. Set it and forget it with intelligent queue management.',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: Globe,
                title: 'Multi-Platform',
                description: 'Twitter, LinkedIn, Facebook, Instagram, and more. One dashboard to rule them all.',
                gradient: 'from-red-500 to-pink-500'
              },
              {
                icon: BarChart3,
                title: 'Deep Analytics',
                description: 'Track engagement, reach, and conversions. Data-driven insights that actually help you grow.',
                gradient: 'from-pink-500 to-purple-500'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Work together seamlessly with role-based access, approval workflows, and shared content libraries.',
                gradient: 'from-purple-500 to-indigo-500'
              },
              {
                icon: Shield,
                title: 'Brand Safety',
                description: 'Never post something you regret. Preview, schedule, and approve content before it goes live.',
                gradient: 'from-indigo-500 to-blue-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500" />
                
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform duration-500`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                <div className="mt-6 inline-flex items-center text-sm font-semibold text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '50K+', label: 'Active Users' },
                { value: '2M+', label: 'Posts Published' },
                { value: '99.9%', label: 'Uptime' },
                { value: '4.9/5', label: 'User Rating' }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-5xl md:text-6xl font-black text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-black/80 font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-8 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Ready to Transform Your
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-orange-300 to-red-400">
              Content Game?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of creators and teams who've already made the switch. Start creating content that converts.
          </p>

          <Link href="/auth/signup">
            <button className="px-12 py-5 bg-linear-to-r from-amber-400 to-orange-500 text-black text-lg font-bold rounded-full hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105">
              Start Your Free Trial
            </button>
          </Link>

          <p className="mt-6 text-sm text-gray-500">
            No credit card required • 3 pages per month free • Upgrade anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-sm font-bold mb-4 text-gray-400">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-4 text-gray-400">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-4 text-gray-400">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-4 text-gray-400">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-linear-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Enfinotes</span>
            </div>

            <p className="text-sm text-gray-500">
              © 2026 Enfinotes. All rights reserved.
            </p>

            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}