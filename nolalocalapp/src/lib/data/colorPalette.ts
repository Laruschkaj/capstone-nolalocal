// Vibrant, engaging colors that pop in both light and dark mode
export const eventCardColors = [
  '#E3704B', // Coral
  '#B3B56C', // Olive
  '#243D1D', // Deep Green
  '#8DB2A1', // Sage
  '#972121', // Deep Red
  '#CD989E', // Dusty Rose
  '#AABED7', // Periwinkle
  '#D4A574', // Tan
  '#6B8E7F', // Forest Green
  '#C17767', // Terracotta
  '#8FA3A3', // Slate Blue
  '#B89968', // Caramel
];

// Get a consistent color for an event (based on ID)
export function getEventCardColor(eventId: string): string {
  const hash = eventId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const index = Math.abs(hash) % eventCardColors.length;
  return eventCardColors[index];
}

// Get text color (dark or light) based on background
export function getTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#1a1a1a' : '#ffffff';
}