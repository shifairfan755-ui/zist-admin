import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useBeneficiary(id: string | undefined) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      setLoading(true);

      const { data: beneficiary, error } = await supabase
        .from("beneficiaries")
        .select(`
          *,
          payments(*),
          documents(*)
        `)
        .eq("id", id)
        .single();

      if (!error) setData(beneficiary);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  return { data, loading };
}
