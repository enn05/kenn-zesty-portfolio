import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit" });

export default function LocalTime() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick(); const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return <p>{now ? `It's ${now} in Cavite, Philippines (GMT+8)` : "Cavite, Philippines (GMT+8)"}</p>;
}