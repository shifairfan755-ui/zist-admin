import { useEffect, useState } from "react";
import { getUserRole } from "./getUserRole";

export default function useUserRole(email?: string) {
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    async function load() {
      const r = await getUserRole(email);
      setRole(r);
      setLoading(false);
    }

    load();
  }, [email]);

  return { role, loading };
}
