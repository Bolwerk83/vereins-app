import React from 'react'

/* Einheitliches, gezeichnetes Icon-Set (statt geräteabhängiger Emojis) */
const ICON_PATHS = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 11h18" /></>,
  cart: <><circle cx="9" cy="20" r="1.6" /><circle cx="18" cy="20" r="1.6" /><path d="M2 3h3l2.6 12.5a1.8 1.8 0 0 0 1.8 1.5h7.9a1.8 1.8 0 0 0 1.8-1.4L21 8H6" /></>,
  heart: <path d="M12 21C7 16.5 3 13.2 3 8.9A4.9 4.9 0 0 1 7.9 4c1.7 0 3.2.8 4.1 2.1A5 5 0 0 1 16.1 4 4.9 4.9 0 0 1 21 8.9c0 4.3-4 7.6-9 12.1Z" />,
  landmark: <><path d="M3 21h18" /><path d="M5 21v-9M9.5 21v-9M14.5 21v-9M19 21v-9" /><path d="M2.5 9 12 3l9.5 6z" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 5.2a3.5 3.5 0 0 1 0 5.6" /><path d="M17.5 14.5a6.5 6.5 0 0 1 4 5.5" /></>,
  user: <><circle cx="12" cy="8" r="3.8" /><path d="M5 20.5a7 7 0 0 1 14 0" /></>,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  briefcase: <><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></>,
  trophy: <><path d="M8 21h8M12 17.5V21" /><path d="M7 4h10v5a5 5 0 0 1-10 0Z" /><path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10" /></>,
  link: <><path d="M10 13.5a4 4 0 0 0 6 .5l3-3a4 4 0 0 0-5.7-5.7l-1.6 1.6" /><path d="M14 10.5a4 4 0 0 0-6-.5l-3 3a4 4 0 0 0 5.7 5.7l1.6-1.6" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  download: <><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" /></>,
  upload: <><path d="M12 20V9" /><path d="m7 13 5-5 5 5" /><path d="M4 4h16" /></>,
  table: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M3 15h18M9 4v16" /></>,
  archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V9" /><path d="M10 13h4" /></>,
  alert: <><path d="M12 3 2.5 20h19Z" /><path d="M12 9.5V14M12 17h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5h.01" /></>,
  activity: <path d="M3 13h4l3 7 4-16 3 9h4" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  bolt: <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12.5l.5-8Z" />,
  today: <><rect x="4" y="4" width="16" height="16.5" rx="2.5" /><path d="M4 9h16M8.5 2.5v3M15.5 2.5v3" /><path d="m10.5 13 1.8-1.2V17" /></>,
  list: <><path d="M10 6.5h10M10 12h10M10 17.5h10" /><path d="m3.6 6.6 1.3 1.3 2.3-2.4M3.6 12.1l1.3 1.3 2.3-2.4M3.6 17.6l1.3 1.3 2.3-2.4" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  more: <><circle cx="5.5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="18.5" cy="12" r="1.2" /></>,
  chevL: <path d="m14.5 6-6 6 6 6" />,
  chevR: <path d="m9.5 6 6 6-6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  knick: <><path d="M5 3.5h9.5l4.5 4.5v12.5H5Z" /><path d="M14.5 3.5V8H19" /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" /></>,
  school: <><path d="M2.5 10 12 5l9.5 5-9.5 5Z" /><path d="M6.5 12.2v4.6c1.6 1.4 3.6 2.2 5.5 2.2s3.9-.8 5.5-2.2v-4.6" /></>,
  hand: <path d="M8 13.5V6a1.5 1.5 0 0 1 3 0v5m0-6.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V14c0 4-2.6 7-6.5 7-2.6 0-4-1.3-5.6-3.9L3.6 14.6a1.5 1.5 0 0 1 2.5-1.7L8 15" />,
  gift: <><rect x="3.5" y="8.5" width="17" height="4" rx="1" /><path d="M5 12.5V20h14v-7.5M12 8.5V20" /><path d="M12 8.5C10 8.5 7.5 7.8 7.5 5.8 7.5 4.6 8.4 4 9.3 4 11 4 12 6.5 12 8.5Zm0 0c2 0 4.5-.7 4.5-2.7 0-1.2-.9-1.8-1.8-1.8C13 4 12 6.5 12 8.5Z" /></>,
  message: <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  cloud: <path d="M7 18.5h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 18.5Z" />,
  trash: <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />,
  repeat: <><path d="m17 3.5 3 3-3 3" /><path d="M4 11.5V10a3.5 3.5 0 0 1 3.5-3.5H20" /><path d="m7 20.5-3-3 3-3" /><path d="M20 12.5V14a3.5 3.5 0 0 1-3.5 3.5H4" /></>,
  pencil: <><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></>,
  inbox: <><path d="M3.5 13.5 6 5h12l2.5 8.5V19H3.5Z" /><path d="M3.5 13.5h5l1.5 2.5h4l1.5-2.5h5" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2" /></>,
}
function Icon({ name, size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ display: 'block', flex: 'none' }}>
      {ICON_PATHS[name] || null}
    </svg>
  )
}
const RowIcon = ({ name }) => <span style={{ color: 'var(--ink-soft)', flex: 'none', display: 'flex' }}><Icon name={name} size={21} /></span>

/* Das Logo: eine Seite mit umgeknickter Ecke – das Eselsohr, wörtlich */
// Der Eselsohr-Esel: Comic-Esel, dessen rechte Ohrspitze wie eine Buchecke
// nach vorn geknickt ist (Innenseite markergelb – das „Eselsohr“).
const LogoMark = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
    style={{ flex: 'none', transform: 'rotate(-4deg)' }}>
    <g stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M8.3 8.6 C5.9 7.8 4.1 4.9 4.8 1.9 C7.7 2.1 9.9 4.8 10.2 7.8 Z" fill="#BDB6B0" />
      <path d="M8.4 7.1 C7.2 6.5 6.3 5.1 6.2 3.7" fill="none" strokeWidth="1" opacity=".5" />
      <path d="M15.7 8.6 C18.1 7.8 19.9 4.9 19.2 1.9 C16.3 2.1 14.1 4.8 13.8 7.8 Z" fill="#BDB6B0" />
      <path d="M15.7 4.4 L19.3 2.4 C20.9 3.9 21.1 6.6 19.8 8.3 C17.9 7.9 16 6.3 15.7 4.4 Z" fill="var(--marker)" />
      <path d="M15.7 4.4 C16.9 4.2 18.3 3.5 19.3 2.4" fill="none" strokeWidth="1.2" />
      <path d="M12 5.8 C16.6 5.8 19.9 9 19.9 13.3 C19.9 17.9 16.5 21.3 12 21.3 C7.5 21.3 4.1 17.9 4.1 13.3 C4.1 9 7.4 5.8 12 5.8 Z" fill="#CFC9C3" />
      <path d="M9.9 6.6 C10.8 5 13.2 5 14.1 6.6 C12.8 7.6 11.2 7.6 9.9 6.6 Z" fill="var(--ink)" strokeWidth="1.2" />
      <path d="M12 13.2 C15 13.2 17 14.8 17 17 C17 19.2 14.9 20.7 12 20.7 C9.1 20.7 7 19.2 7 17 C7 14.8 9 13.2 12 13.2 Z" fill="var(--surface)" />
      <circle cx="10" cy="16.9" r=".75" fill="var(--ink)" stroke="none" />
      <circle cx="14" cy="16.9" r=".75" fill="var(--ink)" stroke="none" />
      <path d="M10.7 19 C11.6 19.7 12.4 19.7 13.3 19" fill="none" strokeWidth="1.1" />
      <circle cx="8.6" cy="10.9" r="1.05" fill="var(--ink)" stroke="none" />
      <circle cx="15.4" cy="10.9" r="1.05" fill="var(--ink)" stroke="none" />
    </g>
  </svg>
)

export { ICON_PATHS, Icon, RowIcon, LogoMark }
