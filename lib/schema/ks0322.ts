export const KS0322_SECTIONS = [
  { key: 'I.Anmerkninger', fields: [{ name: 'entries', type: 'array' }] },
  { key: '1.Dokumenter', fields: [
    { name: 'kontrollskjema_forrige', type: 'status' },
    { name: 'alarminstruks', type: 'status' },
    { name: 'kommentar', type: 'text' }
  ]},
  { key: '2.Stabilitet', fields: [
    { name: 'stabilitetsbok', type: 'status' },
    { name: 'kommentar', type: 'text' }
  ]}
];
