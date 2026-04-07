interface ManagementCard {
  label: string;
  value: string;
  sub: string;
}

interface ManagementUpdate {
  status: string;
  color: string;
  date: string;
}

interface ManagementFeature {
  icon: string;
  label: string;
  active: boolean;
}

interface ManagementCollaboration {
  title: string;
  description: string;
}

interface ManagementSection {
  title: string;
  description?: string;
  cards?: ManagementCard[];
  updates?: ManagementUpdate[];
  features?: ManagementFeature[];
  collaboration?: ManagementCollaboration;
}

interface LandingContent {
  hero: {
    title: {
      main: string;
      benefits: string[];
    };
    subtitle: string;
    chatPlaceholder: string;
    quickActions: { icon: string; label: string }[];
    cta: {
      primary: string;
      secondary: string;
    };
  };
  features: {
    title: string;
    description: string;
    items: {
      title: string;
      description: string;
      icon: string;
      color: string;
    }[];
  };
  ai: {
    badge: string;
    title: string;
    description: {
      highlight: string;
      text: string;
    };
    cta: string;
    agents: { name: string; type: string; color: string }[];
    menu: {
      at: { title: string; options: string[] };
      slash: { title: string; options: string[] };
      cmd: { title: string; message: string };
    };
  };
  planning: {
    badge: string;
    title: string;
    description: {
      highlight: string;
      text: string;
    };
    projects: { name: string; status: string }[];
  };
  management: {
    sections: [
      ManagementSection & { cards: ManagementCard[] },
      ManagementSection & { updates: ManagementUpdate[] },
      ManagementSection & { features: ManagementFeature[]; collaboration: ManagementCollaboration }
    ];
  };
  tracking: {
    schedule: {
      title: string;
      description: string;
      posts: { platform: string; preview: string; time: string }[];
    };
    analytics: {
      title: string;
      description: string;
      totalWords: string;
      stats: { label: string; pct: number; color: string }[];
    };
  };
  pricing: {
    badge: string;
    title: string;
    description: string;
    disclaimer: string;
    links: string[];
    plans: {
      name: string;
      price: number;
      period: string;
      description: string;
      features: string[];
      cta: string;
      highlighted: boolean;
      comingSoon: boolean;
    }[];
  };
  cta: {
    title: string;
    buttons: { label: string; variant: string }[];
  };
  footer: {
    brand: string;
    copyright: string;
  };
  nav: {
    brand: string;
    links: { label: string; href: string }[];
  };
}

export const landingContent: LandingContent = {
  hero: {
    title: {
      main: "Enfinotes helps you",
      benefits: [
        "Write your next viral tweet",
        "Draft your series like a pro",
        "Build an authentic personal brand",
        "Master your content calendar"
      ]
    },
    subtitle: "Meet the all-in-one content creation workspace for modern creators. Turn your raw ideas into high-impact distribution across every social channel.",
    chatPlaceholder: "How can I help you today?",
    quickActions: [
      { icon: "PenTool", label: "Write a script" },
      { icon: "GraduationCap", label: "Start a new series" },
      { icon: "Layout", label: "Schedule February" },
      { icon: "Code", label: "Code" },
      { icon: "Coffee", label: "Life stuff" }
    ],
    cta: {
      primary: "Start creating",
      secondary: "New: Personal Brand Optimizer (Beta)"
    }
  },

  features: {
    title: "Engineered for creative growth",
    description: "Enfinotes is built on the workflows that distinguish top-tier creators: relentless focus, fast iteration, and a commitment to authentic storytelling.",
    items: [
      {
        title: "Multi-Channel Sync",
        description: "Draft once and deploy optimized versions to X, LinkedIn, and Threads instantly.",
        icon: "Terminal",
        color: "indigo"
      },
      {
        title: "Creative Speed",
        description: "Move from a fleeting thought to a polished thread in seconds with rapid-capture tools.",
        icon: "Layout",
        color: "purple"
      },
      {
        title: "Engagement Insights",
        description: "Understand which hooks resonate with your audience before you commit to the post.",
        icon: "BarChart2",
        color: "blue"
      }
    ]
  },

  ai: {
    badge: "Artificial Intelligence",
    title: "AI-assisted brand development",
    description: {
      highlight: "Enfinotes for Creators.",
      text: "Delegate the research and formatting to agents that understand your unique voice."
    },
    cta: "Explore agents",
    agents: [
      { name: "Tone Matcher", type: "Agent", color: "indigo" },
      { name: "Trend Researcher", type: "Agent", color: "purple" },
      { name: "Hook Optimizer", type: "Agent", color: "blue" },
      { name: "Social Strategist", type: "Lead", color: "orange" }
    ],
    menu: {
      at: {
        title: "Mention Agent",
        options: ["Tone Matcher", "Trend Researcher", "Hook Specialist"]
      },
      slash: {
        title: "Quick Actions",
        options: ["Summarize", "Rewrite as Thread", "Optimize Hooks"]
      },
      cmd: {
        title: "Command detected",
        message: "Type what you want to create..."
      }
    }
  },

  planning: {
    badge: "Campaign and roadmap planning",
    title: "Set the content direction",
    description: {
      highlight: "Align your brand around a unified timeline.",
      text: "Plan long-form series and daily distribution with visual roadmap tools."
    },
    projects: [
      { name: "10-Part Video Masterclass", status: "In Progress" },
      { name: "Personal Brand Launch", status: "Queueing" }
    ]
  },

  management: {
    sections: [
      {
        title: "Manage your brand end-to-end",
        description: "Consolidate hooks, scripts, captions, and assets in one centralized creator dashboard.",
        cards: [
          { label: "Status", value: "Drafting", sub: "X" },
          { label: "Medium", value: "Short-form", sub: "TikTok" }
        ]
      },
      {
        title: "Growth updates",
        description: "Communicate your progress and account health with automated performance snapshots.",
        updates: [
          { status: "Off track", color: "red", date: "Jan 20" },
          { status: "At risk", color: "orange", date: "Jan 24" },
          { status: "On track", color: "green", date: "Jan 29" }
        ]
      },
      {
        title: "Ideate and specify what to post next",
        features: [
          { icon: "FileText", label: "Collaborative scripts", active: true },
          { icon: "MessageSquare", label: "Inline feedback", active: false },
          { icon: "Command", label: "Text-to-post commands", active: false }
        ],
        collaboration: {
          title: "Collaborate on ideas",
          description: "Write down content ideas and work together on hooks in realtime. Add **style** and ##structure with creator-first formatting."
        }
      }
    ]
  },

  tracking: {
    schedule: {
      title: "Schedule content ahead of time",
      description: "Plan your posts days or weeks in advance. Set a date and time, and Enfinotes publishes automatically so you never miss a beat.",
      posts: [
        { platform: "twitter",   preview: "The one habit that changed how I write threads…",    time: "Today · 9:00 AM"  },
        { platform: "linkedin",  preview: "3 lessons from shipping a product in 30 days",        time: "Tomorrow · 12:00 PM" },
        { platform: "instagram", preview: "Behind the scenes: my writing setup in 2025",         time: "Apr 5 · 6:00 PM" }
      ]
    },
    analytics: {
      title: "Track your output with Analytics",
      description: "See words written, content type breakdowns, and writing activity — all in one place.",
      totalWords: "12,480",
      stats: [
        { label: "Notes",     pct: 85, color: "#e5e5e5" },
        { label: "Documents", pct: 55, color: "#60a5fa" },
        { label: "Twitter",   pct: 40, color: "#38bdf8" },
        { label: "Instagram", pct: 30, color: "#f472b6" },
        { label: "LinkedIn",  pct: 20, color: "#3b82f6" }
      ]
    }
  },

  pricing: {
    badge: "Pricing",
    title: "Choose your plan",
    description: "Start free and upgrade as you grow. All plans include access to our AI-powered writing tools.",
    disclaimer: "All plans include 14-day money-back guarantee. No credit card required for free tier.",
    links: ["Compare plans", "View FAQ", "Contact sales"],
    plans: [
      {
        name: "Free",
        price: 0,
        period: "forever",
        description: "For creators just getting started",
        features: [
          "15 notes per month",
          "1 document per month",
          "3 AI assists per month",
          "Social post drafting",
          "Email support"
        ],
        cta: "Start free",
        highlighted: false,
        comingSoon: false
      },
      {
        name: "Pro",
        price: 20,
        period: "month",
        description: "For serious creators",
        features: [
          "Unlimited notes & documents",
          "Unlimited AI assistance",
          "Multi-platform posting",
          "Analytics dashboard",
          "Priority support"
        ],
        cta: "Upgrade to Pro",
        highlighted: true,
        comingSoon: false
      },
      {
        name: "Enterprise",
        price: 149,
        period: "month",
        description: "For teams and agencies",
        features: [
          "Everything in Pro",
          "Team collaboration",
          "SSO authentication",
          "API access",
          "Dedicated account manager"
        ],
        cta: "Contact sales",
        highlighted: false,
        comingSoon: true
      }
    ]
  },

  cta: {
    title: "Plan the present. Build the future.",
    buttons: [
      { label: "Contact sales", variant: "secondary" },
      { label: "Get started", variant: "primary" }
    ]
  },

  footer: {
    brand: "Enfinotes",
    copyright: "© 2026 Content Engineering Lab"
  },

  nav: {
    brand: "Enfinotes",
    links: [
      { label: "Log in", href: "/auth/signin" },
      { label: "Sign up", href: "/auth/signup" }
    ]
  }
};
