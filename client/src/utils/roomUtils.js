// Generates a Google Meet style code: xxx-yyyy-zzz (e.g. nwv-tykp-pzg)
export const generateMeetingCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const getRandomPart = (len) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };
  return `${getRandomPart(3)}-${getRandomPart(4)}-${getRandomPart(3)}`;
};

// Cleans input code or URL (e.g. "https://meet.google.com/abc-defg-hij" -> "abc-defg-hij")
export const sanitizeMeetingCode = (input) => {
  if (!input) return '';
  let str = input.trim().toLowerCase();

  // If a URL was entered, extract the path/code part
  if (str.includes('/')) {
    const parts = str.split('/');
    str = parts[parts.length - 1] || parts[parts.length - 2];
  }

  // Remove unwanted non-alphanumeric except hyphen
  str = str.replace(/[^a-z0-9-]/g, '');

  // If entered as 10 characters without hyphens (e.g. "abcdefghij"), format as xxx-yyyy-zzz
  if (/^[a-z0-9]{10}$/.test(str)) {
    str = `${str.slice(0, 3)}-${str.slice(3, 7)}-${str.slice(7)}`;
  }

  return str;
};

// Generates consistent pastel/Google palette color based on participant name
export const getAvatarColor = (name = '') => {
  const colors = [
    '#1a73e8', // Google Blue
    '#ea4335', // Google Red
    '#fbbc04', // Google Yellow
    '#34a853', // Google Green
    '#e91e63', // Pink
    '#9c27b0', // Purple
    '#009688', // Teal
    '#ff5722', // Deep Orange
    '#3f51b5', // Indigo
    '#00bcd4', // Cyan
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from user name (e.g. "John Doe" -> "JD", "Atul" -> "A")
export const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Format seconds into HH:MM:SS or MM:SS
export const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
