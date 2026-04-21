// Replaced AI service with local RNG service

const intros = [
  "The reels have stopped! The winners are:",
  "Jackpot alert! Check out who won:",
  "Ladies and Gentlemen, the slots have decided:",
  "The symbols have aligned:",
  "Fortune favors the bold! Winners are:",
];

export const generateAnnouncement = async (results: { role: string; winner: string }[]): Promise<string> => {
  // Simulate a small delay for dramatic effect
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (results.length === 0) return "No winners selected.";

  const intro = intros[Math.floor(Math.random() * intros.length)];
  
  // Create a string like: "Moderator: Mario, Notary: Luigi"
  const details = results
    .map(r => `${r.role}: ${r.winner}`)
    .join(" | ");

  return `${intro} ${details}`;
};
