import { useEffect, useState } from "react";
import { fetchHealthStatus } from "../lib/api";

export function HealthCheck() {
  const [status, setStatus] = useState("Verificando API...");

  useEffect(() => {
    fetchHealthStatus()
      .then((data) => setStatus(data.message))
      .catch(() => setStatus("Erro ao conectar com API"));
  }, []);

  return (
    <div>
      <h3>Status da Integração:</h3>
      <p>{status}</p>
    </div>
  );
}
