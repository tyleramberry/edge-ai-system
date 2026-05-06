// Line-style SVG icons for Edge AI for Streak Advisors
// All icons use stroke, no fill, sized to 20x20 viewBox by default

export function IconLogo({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" />
      <path d="M10 6V14M6.5 8L13.5 12M13.5 8L6.5 12" strokeWidth="1.2" />
    </svg>
  );
}

export function IconBriefcase({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="16" height="11" rx="2" />
      <path d="M6 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      <line x1="2" y1="12" x2="18" y2="12" />
    </svg>
  );
}

export function IconDocument({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
      <path d="M12 2v4h4" />
      <line x1="6" y1="10" x2="14" y2="10" />
      <line x1="6" y1="13" x2="11" y2="13" />
      <path d="M11 15.5l1.5 1.5 3-3" strokeWidth="1.3" />
    </svg>
  );
}

export function IconClipboard({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="12" height="14" rx="2" />
      <path d="M7 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
      <line x1="7" y1="9" x2="13" y2="9" />
      <line x1="7" y1="12" x2="13" y2="12" />
      <line x1="7" y1="15" x2="10" y2="15" />
    </svg>
  );
}

export function IconCalendar({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="14" rx="2" />
      <line x1="2" y1="9" x2="18" y2="9" />
      <line x1="6" y1="2" x2="6" y2="6" />
      <line x1="14" y1="2" x2="14" y2="6" />
      <rect x="6" y="12" width="2" height="2" rx="0.5" strokeWidth="1" />
      <rect x="11" y="12" width="2" height="2" rx="0.5" strokeWidth="1" />
    </svg>
  );
}

export function IconMenu({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="6" x2="17" y2="6" />
      <line x1="3" y1="10" x2="17" y2="10" />
      <line x1="3" y1="14" x2="17" y2="14" />
    </svg>
  );
}

export function IconSend({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="16" x2="10" y2="4" />
      <polyline points="5,9 10,4 15,9" />
    </svg>
  );
}

export function IconSignOut({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H4a1 1 0 00-1 1v12a1 1 0 001 1h4" />
      <polyline points="13,14 17,10 13,6" />
      <line x1="17" y1="10" x2="7" y2="10" />
    </svg>
  );
}

export function IconSpinner({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="10" cy="10" r="7" strokeOpacity="0.25" />
      <path d="M10 3a7 7 0 017 7" strokeOpacity="0.9" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} svg{transform-origin:center;animation:spin 0.8s linear infinite}`}</style>
    </svg>
  );
}

// Map agent ID to icon component
export function AgentIcon({ agentId, size = 18, color = 'currentColor' }) {
  switch (agentId) {
    case 'grant':    return <IconDocument size={size} color={color} />;
    case 'contract': return <IconClipboard size={size} color={color} />;
    case 'personal': return <IconCalendar size={size} color={color} />;
    default:         return <IconBriefcase size={size} color={color} />;
  }
}
