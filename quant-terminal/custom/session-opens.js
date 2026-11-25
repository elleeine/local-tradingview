// Opening bells for the Sydney, Tokyo, London and New York exchanges.
// Exchange clocks are used with their own daylight saving rules; the app shows bar times in its local zone.
const SESSIONS = [
  { zone: 'Australia/Sydney', bell: 600, label: 'Sydney', color: '#42a5f5' },
  { zone: 'Asia/Tokyo', bell: 540, label: 'Tokyo', color: '#ab47bc' },
  { zone: 'Europe/London', bell: 480, label: 'London', color: '#26a69a' },
  { zone: 'America/New_York', bell: 570, label: 'New York', color: '#ffa726' },
].map((s) => ({
  ...s,
  fmt: new Intl.DateTimeFormat('en-GB', {
    timeZone: s.zone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }),
}));

function localParts(session, seconds) {
  const o = {};
  for (const part of session.fmt.formatToParts(seconds * 1000)) o[part.type] = part.value;
  return {
    date: `${o.year}-${o.month}-${o.day}`,
    mins: Number(o.hour) * 60 + Number(o.minute),
  };
}

export default {
  name: 'Session opens (Sydney, Tokyo, London, New York)',
  overlay: true,
  outputs: [{ key: 'value', label: 'Session opens', kind: 'line', color: '#90a4ae' }],
  calc(bars) {
    const markers = [];
    const seen = new Set();
    for (let i = 0; i < bars.length; i++) {
      const start = bars[i].time;
      const step = i + 1 < bars.length
        ? bars[i + 1].time - start
        : i > 0 ? start - bars[i - 1].time : 3600;
      const end = start + (step > 0 ? step : 3600);
      for (const s of SESSIONS) {
        const a = localParts(s, start);
        const b = localParts(s, end);
        // A daily or weekly bar spans many local dates; it has no single bell.
        if (a.date !== b.date || s.bell < a.mins || s.bell >= b.mins) continue;
        const key = `${s.zone}|${a.date}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const hh = String(Math.floor(s.bell / 60)).padStart(2, '0');
        const mm = String(s.bell % 60).padStart(2, '0');
        markers.push({
          time: start,
          position: 'aboveBar',
          shape: 'arrowUp',
          color: s.color,
          text: `${s.label} ${hh}:${mm}`,
        });
      }
    }
    return { value: bars.map(() => NaN), markers };
  },
};
