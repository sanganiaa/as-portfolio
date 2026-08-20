/* ============================================================
   CONFIG — everything swappable lives here
   ============================================================ */

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  newTab: boolean;
  svg: string;
}

export interface SatelliteConfig {
  count: number;
  sizeMin: number;
  sizeMax: number;
  depthMin: number;
  depthMax: number;
  drift: number;
  spinIdle: number;
  pushForce: number;
  stirForce: number;
  restitution: number;
  damping: number;
  maxSpeed: number;
  rippleStrength: number;
  blockCollide: boolean;
  draggable: boolean;
  clickSpin: boolean;
}

export interface Config {
  theme: { accent: string; accentBright: string };
  nameLines: string[];
  cycleMs: number;
  links: LinkItem[];
  satellites: SatelliteConfig;
  about: {
    eyebrow: string;
    heading: string;
    photo: string;
    initials: string;
    bio: string[];
    meta: string;
  };
  motion: {
    parallaxDeg: number;
    baseTiltDeg: number;
    depthPush: number;
    hoverTiltDeg: number;
    flipNavDelayMs: number;
    prismDragFactor: number;
    blockDragRadius: number;
    blockSpring: number;
    blockSpringDamping: number;
  };
}

export const CONFIG: Config = {
  theme: {
    accent: "#8f6fff",
    accentBright: "#c9b6ff",
  },

  nameLines: ["Aayush Sangani", "Computer Engineer", "Hardware Engineer @ Intel"],
  cycleMs: 3800,

  links: [
    {
      id: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/aayush-sangani",
      newTab: true,
      svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>`,
    },
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com/sanganiaa",
      newTab: true,
      svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.26 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>`,
    },
    {
      id: "resume",
      label: "Resume",
      url: "resume.pdf",
      newTab: true,
      svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-5 4h8v1.6H8V13zm0 3.4h8V18H8v-1.6z"/></svg>`,
    },
    {
      id: "email",
      label: "Email",
      url: "mailto:sanganiaayush@gmail.com",
      newTab: false,
      svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.24-8 5-8-5V6.4l8 5 8-5v1.84z"/></svg>`,
    },
  ],

  satellites: {
    count: 26,
    sizeMin: 14,
    sizeMax: 30,
    depthMin: 60,
    depthMax: 320,
    drift: 0.25,
    spinIdle: 0.3,
    pushForce: 1.6,
    stirForce: 0.1,
    restitution: 0.9,
    damping: 0.995,
    maxSpeed: 6,
    rippleStrength: 24,
    blockCollide: true,
    draggable: true,
    clickSpin: true,
  },

  about: {
    eyebrow: "// about",
    heading: "Aayush Sangani",
    photo: "assets/profile.jpg",
    initials: "AS",
    bio: [
      "I'm a computer engineering student at UC San Diego and a hardware engineering intern at Intel, where I work on CPU physical design — floorplanning, timing closure, and getting RTL all the way to GDS.",
      "I like living where silicon meets software: RTL and verification on one side, full-stack tooling on the other.",
    ],
    meta: "UC San Diego · Computer Engineering · Class of 2028",
  },

  motion: {
    parallaxDeg: 6,
    baseTiltDeg: 5,
    depthPush: 34,
    hoverTiltDeg: 13,
    flipNavDelayMs: 520,
    prismDragFactor: 0.55,
    blockDragRadius: 80,
    blockSpring: 0.12,
    blockSpringDamping: 0.82,
  },
};
