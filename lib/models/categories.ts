import { Category } from "@/types"

// use colors from tailwindcss
export const CATEGORIES: Record<string, Category> = {
  ROLEPLAY: {
    category: "Roleplay",
    description:
      "Specialized in interactive storytelling and character-based scenarios",
    color: "pink"
  },
  PROGRAMMING: {
    category: "Programming",
    description:
      "Focused on coding, software development, and technical problem-solving",
    color: "orange"
  },
  PROGRAMMING_SCRIPTING: {
    category: "Programming/Scripting",
    description: "Specialized in both programming and scripting languages",
    color: "amber"
  },
  MARKETING: {
    category: "Marketing",
    description: "Expertise in digital marketing strategies and techniques",
    color: "yellow"
  },
  MARKETING_SEO: {
    category: "Marketing/SEO",
    description:
      "Focused on digital marketing with emphasis on search engine optimization",
    color: "lime"
  },
  TECHNOLOGY: {
    category: "Technology",
    description: "General technology and computer science topics",
    color: "green"
  },
  TECHNOLOGY_WEB: {
    category: "Technology/Web",
    description: "Specialized in web development and internet technologies",
    color: "emerald"
  },
  SCIENCE: {
    category: "Science",
    description: "Covers various scientific disciplines and research",
    color: "teal"
  },
  TRANSLATION: {
    category: "Translation",
    description: "Specialized in language translation and interpretation",
    color: "cyan"
  },
  LEGAL: {
    category: "Legal",
    description: "Focused on law, regulations, and legal processes",
    color: "sky"
  },
  FINANCE: {
    category: "Finance",
    description:
      "Expertise in financial markets, economics, and business topics",
    color: "blue"
  },
  HEALTH: {
    category: "Health",
    description: "Covers medical sciences, healthcare, and wellness topics",
    color: "indigo"
  },
  TRIVIA: {
    category: "Trivia",
    description: "Specialized in general knowledge and interesting facts",
    color: "violet"
  },
  ACADEMIA: {
    category: "Academia",
    description:
      "Focused on academic research, writing, and higher education topics",
    color: "purple"
  }
}
