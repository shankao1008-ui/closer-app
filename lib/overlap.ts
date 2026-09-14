export type Slot = { day: number; start: number; end: number };
export type Availability = { user_id: string; tz: string; slots: Slot[] };
export function parseClock(value: string) {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [h,m] = value.split(':').map(Number);
  return m % 15 === 0 ? h * 60 + m : null;
}
export function findOverlap(a: Availability, b: Availability, now = Date.now()) {
  const make = (tz: string) => new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const fa=make(a.tz), fb=make(b.tz);
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const fits=(t: number, fmt: Intl.DateTimeFormat, slots: Slot[]) => {
    const p=Object.fromEntries(fmt.formatToParts(t).map(x=>[x.type,x.value]));
    const day=days.indexOf(p.weekday), minute=Number(p.hour)*60+Number(p.minute);
    return slots.some(s=>s.day===day && minute>=s.start && minute<s.end);
  };
  const out: number[]=[];
  // Check each minute of a real 30-minute interval, including DST transitions.
  for(let t=Math.ceil((now+60000)/900000)*900000;t<now+7*86400000;t+=900000) {
    let valid=true;
    for(let m=0;m<30;m++) if(!fits(t+m*60000,fa,a.slots)||!fits(t+m*60000,fb,b.slots)){valid=false;break;}
    if(valid){out.push(t);t+=900000;}
  }
  return out;
}
export function localTime(value: string | number, tz: string, lang: string) {
  return new Intl.DateTimeFormat(lang, { timeZone: tz, month:'short', day:'numeric', weekday:'short', hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZoneName:'shortOffset' }).format(new Date(value));
}
