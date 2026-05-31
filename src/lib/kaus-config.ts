// Centralized Kaus configuration. Update creator details here without
// touching chatbot logic.

export const KAUS_CONFIG = {
  appName: "Kaus",
  appTagline: "AI Assistant",
  version: "1.0.0",
  creator: {
    name: "Pendota Mani",
    instagram: "@mvnixm",
    instagramUrl: "https://instagram.com/mvnixm",
    achievement:
      "Currently holds a world record for completing 5000 repetitions using a 5 kg hand gripper.",
  },
  features: ["Gemini Powered", "Mobile Friendly", "Fast and Secure"],
  welcomeMessage: "Hello! I'm Kaus, your AI assistant. How can I help you today?",
  showCreatorBranding: true,
} as const;

export const KAUS_CREATOR_RESPONSE = `I was created by ${KAUS_CONFIG.creator.name}. My creator currently holds a world record for completing 5000 repetitions using a 5 kg hand gripper. You can follow him on Instagram: ${KAUS_CONFIG.creator.instagram}`;
