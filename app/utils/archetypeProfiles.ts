export interface ArchetypeSection {
  icon: string;
  title: string;
  content: string;
}

export interface ArchetypeProfile {
  label: string;
  color: string;
  emoji: string;
  arrow: string;
  tagline: string;
  rarity: string;
  sections: ArchetypeSection[];
}

/**
 * Presentation-only profile data for each archetype.
 * Keys MUST match Firestore / setupArchetypes IDs.
 */
export const ARCHETYPE_PROFILES: Record<string, ArchetypeProfile> = {
  faithful: {
    label: "The Devout Faithful",
    color: "#D4A843", // gold
    emoji: "🕌",
    arrow: "💛",
    tagline:
      "Cupid's arrow struck deep — your heart belongs fully to faith, community, and devotion.",
    rarity: "The spiritual bedrock of the community",
    sections: [
      {
        icon: "🤲",
        title: "Your Spiritual Core",
        content:
          "Your faith isn't just a part of your life — it is the heartbeat of everything you do. You feel a deep, instinctive connection to the Bohra community and its traditions, and this connection shapes your daily rhythms, relationships, and life decisions. Vaaz, maatham, and khidmat are not obligations; they are genuine sources of nourishment and meaning.\n\nYou carry traditions forward not because someone told you to, but because you've felt their truth deeply. Your devotion is quiet, steady, and personal, even as it connects you to something far larger than yourself.",
      },
      {
        icon: "🌙",
        title: "Community & Belonging",
        content:
          "You are someone others naturally look to as an example — not because you seek attention, but because your consistency and sincerity are visible. You find deep comfort in the rhythms of community life: the gatherings, shared meals, and collective prayers.\n\nFor you, identity and community are inseparable. Being Bohra is not a label; it is a lived experience that touches every corner of your life. You feel most yourself when surrounded by the traditions and people that raised you in faith.",
      },
      {
        icon: "⭐",
        title: "Strengths & Growth",
        content:
          "Your greatest gift is your steadfastness. In a world that constantly shifts and questions, you offer continuity, sincerity, and depth. You remember why things matter, and you keep the spiritual flame alive for those around you.\n\nYour growth edge lies in remaining open to those who experience faith differently. Your convictions are a source of strength, but the community is enriched when its most devoted members also extend curiosity and warmth to those still finding their way.",
      },
    ],
  },
  questioner: {
    label: "The Curious Questioner",
    color: "#5BA89D", // teal
    emoji: "🔍",
    arrow: "💚",
    tagline:
      "Cupid's arrow sparked your curiosity — you seek meaning through understanding and personal truth.",
    rarity: "The community's thoughtful explorers",
    sections: [
      {
        icon: "💭",
        title: "Your Seeking Nature",
        content:
          "You engage with faith from a place of deep curiosity, not doubt. You want to understand why — why this tradition, why this practice, what does it truly mean? For you, spiritual growth comes from wrestling with ideas and arriving at personal understanding.\n\nYou're likely moved by certain moments in vaaz or maatham, but you also notice when something doesn't resonate. You don't dismiss tradition — you want to understand it deeply enough to make it genuinely yours.",
      },
      {
        icon: "🌿",
        title: "Faith & Independence",
        content:
          "You walk a thoughtful line between tradition and personal conviction. You value the Bohra community and its cultural richness, but you believe that faith must be authentic to be meaningful. You're comfortable sitting with ambiguity and asking questions others might avoid.\n\nThis doesn't make you less faithful — it makes your faith more considered. You read between the lines, notice the beauty in the philosophy behind practice, and want to carry forward what is truly meaningful rather than performing what is merely expected.",
      },
      {
        icon: "⭐",
        title: "Strengths & Growth",
        content:
          "Your gift is intellectual honesty combined with genuine spiritual engagement. You bring fresh perspectives and thoughtful dialogue to a community that benefits enormously from self-reflection. You are the bridge between tradition and evolution.\n\nYour growth area is finding peace in the tension between questioning and belonging. Not every question needs an answer right now, and sometimes showing up — even with uncertainty — is itself a form of devotion.",
      },
    ],
  },
  harmonizer: {
    label: "The Balanced Harmonizer",
    color: "#7A9E7E", // sage
    emoji: "⚖️",
    arrow: "🤎",
    tagline:
      "Cupid aimed for balance — and hit perfectly. You move gracefully between devotion and modern life.",
    rarity: "The community's natural bridge-builders",
    sections: [
      {
        icon: "🤝",
        title: "Your Balanced Way",
        content:
          "You hold multiple worlds in balance with intuitive grace. You value your Bohra identity and participate in community life with sincerity, but you also navigate modern realities with pragmatism. You don't see faith and modernity as opposites — they're threads in the same fabric.\n\nYou show up for vaaz and Moharram not out of guilt, but out of genuine appreciation. At the same time, you've made peace with the fact that your engagement may look different from others', and that's perfectly fine.",
      },
      {
        icon: "🌍",
        title: "Navigating Two Worlds",
        content:
          "You sit comfortably at a community thaal and then seamlessly transition to professional or social contexts outside the community. This adaptability isn't superficial — it comes from genuine integration of your Bohra values with your personal worldview.\n\nYou respect tradition deeply while appreciating that the world is complex. You make space for both razaa and personal judgment, for both khidmat and personal boundaries. This balance is your signature — and it's more rare and valuable than you might realize.",
      },
      {
        icon: "⭐",
        title: "Strengths & Growth",
        content:
          "Your strength lies in emotional intelligence and adaptability. You make the community feel welcoming to people across the spectrum. You are a living example that faith can be both sincere and flexible.\n\nYour growth edge is committing more deeply when it matters. Balance is beautiful, but sometimes the most meaningful growth comes from leaning in — deepening a spiritual practice, or more boldly bringing your modern perspective into community conversations.",
      },
    ],
  },
  keeper: {
    label: "The Devoted Keeper",
    color: "#E8896F", // orange light
    emoji: "🏛️",
    arrow: "🧡",
    tagline:
      "Cupid's arrow bound you to loyalty — you preserve the bonds that hold the community together.",
    rarity: "The community's faithful guardians",
    sections: [
      {
        icon: "🕊️",
        title: "Your Devotional Heart",
        content:
          "Your faith is deeply woven into your identity, expressed through your love for Moula, commitment to community, and loyalty to the Bohra way of life. You may not always engage at the deepest intellectual level, but your devotion is unmistakable and sincere.\n\nFor you, faith is relational. It lives in the bond with Aqa Moula, in the comfort of community gatherings, in the meaning of razaa, and in the pride of being part of something enduring. Your practice is driven by love and loyalty.",
      },
      {
        icon: "👨‍👩‍👧‍👦",
        title: "Community & Legacy",
        content:
          "You are a keeper of continuity. You understand that traditions survive because people choose to honor them — and you make that choice willingly. Having Moula name your children, attending events with family, participating in khidmat — these are expressions of who you are.\n\nYou may sometimes feel tension between community expectations and the pace of modern life, but you tend to resolve that tension in favor of tradition. You believe the community's strength lies in its cohesion, and you're willing to be part of that foundation.",
      },
      {
        icon: "⭐",
        title: "Strengths & Growth",
        content:
          "Your strength is loyalty and consistency. You show up, preserve, and hold the community together through steady presence. Without people like you, traditions would fade and bonds would weaken.\n\nYour growth opportunity lies in deepening personal engagement with the why behind your practices. You already have the devotion — adding reflection could transform your practice from something you do into something that continually reveals new meaning.",
      },
    ],
  },
  independent: {
    label: "The Free Independent",
    color: "#C97B6B", // rose
    emoji: "🦅",
    arrow: "❤️",
    tagline:
      "Cupid's arrow set you free — you chart your own course while carrying cultural roots within.",
    rarity: "The community's independent voices",
    sections: [
      {
        icon: "🌅",
        title: "Your Independent Path",
        content:
          "You've chosen — consciously or gradually — to define your life primarily on your own terms. Your relationship with the Bohra community may be complex: perhaps you appreciate the cultural heritage while feeling distant from religious practices, or perhaps your personal values have led you in a different direction.\n\nThis doesn't mean you've rejected your roots. Many Independents carry a quiet appreciation for the community that shaped them, even as they forge a very different path.",
      },
      {
        icon: "🧭",
        title: "Identity & Autonomy",
        content:
          "You value personal authenticity above conformity. You believe a meaningful life comes from honest self-examination, and you're willing to sit with the discomfort that brings — especially when your choices diverge from community expectations.\n\nYou may engage selectively with Bohra traditions, choosing moments and practices that resonate personally. This selective engagement isn't laziness; it's integrity. You refuse to participate in something that doesn't feel genuine.",
      },
      {
        icon: "⭐",
        title: "Strengths & Growth",
        content:
          "Your strength is courage and self-awareness. You know who you are and what you value, and you've built a life that reflects those values authentically. Your perspective is valuable precisely because it's different.\n\nYour growth edge is staying connected. Independence doesn't have to mean isolation. The community has room for your perspective, and your occasional presence — a Moharram visit, a family gathering — can be meaningful for both you and those who care about you.",
      },
    ],
  },
};
