// Vibrant, engaging colors that pop in both light and dark mode
export const eventCardColors = [
  '#F15B3E', 
  '#d0c3e2ff',   
  '#F7B12D',
  '#CDD0DB',
  '#EDA68E',
  '#a0b4f0ff',
];

// Get a consistent color for an event (based on ID)
export function getEventCardColor(eventId: string): string {
  const hash = eventId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const index = Math.abs(hash) % eventCardColors.length;
  return eventCardColors[index];
}

// Always return dark text (we removed dark colors)
export function getTextColor(bgColor: string): string {
  return '#1a1a1a'; // Always dark text
}