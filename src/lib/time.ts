// Convert "HH:MM" local time to "HH:MM" UTC
export function localTimeToUTC(localTime: string): string {
  const [h, m] = localTime.split(":").map(Number);
  const offset = new Date().getTimezoneOffset(); // UTC - local, minutes
  const utcMinutes = (h * 60 + m + offset + 1440) % 1440;
  return `${String(Math.floor(utcMinutes / 60)).padStart(2, "0")}:${String(utcMinutes % 60).padStart(2, "0")}`;
}

// Convert "HH:MM" UTC time to "HH:MM" local
export function utcTimeToLocal(utcTime: string): string {
  const [h, m] = utcTime.split(":").map(Number);
  const offset = new Date().getTimezoneOffset(); // UTC - local, minutes
  const localMinutes = (h * 60 + m - offset + 1440) % 1440;
  return `${String(Math.floor(localMinutes / 60)).padStart(2, "0")}:${String(localMinutes % 60).padStart(2, "0")}`;
}

// Format "HH:MM" UTC time as local 12h string, e.g. "10:00 AM"
export function formatLocalTime(utcTime: string): string {
  const local = utcTimeToLocal(utcTime);
  const [hh, mm] = local.split(":");
  const h = parseInt(hh);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mm} ${ampm}`;
}
