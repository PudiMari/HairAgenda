import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

let isTelemetryInitialized = false;

export const initTelemetry = () => {
  if (isTelemetryInitialized) {
    return;
  }

  const faroUrl = import.meta.env.VITE_FARO_URL;
  const faroAppId = import.meta.env.VITE_FARO_APP_ID;

  if (!faroUrl || !faroAppId) {
    console.warn("[Observability] Faro URL or App ID not found. Frontend observability disabled.");
    return;
  }

  initializeFaro({
    url: faroUrl,
    app: {
      name: import.meta.env.VITE_FARO_APP_NAME || 'HairAgenda',
      id: faroAppId,
      version: '1.0.0',
      environment: import.meta.env.MODE || 'development',
    },
    instrumentations: [
      // Mandatory, omits default instrumentations otherwise.
      ...getWebInstrumentations(),

      // Initialization of the tracing package.
      // This will automatically connect to the OpenTelemetry SDK.
      new TracingInstrumentation({
        instrumentationOptions: {
          // Pass the list of URLs that should receive trace headers
          propagateTraceHeaderCorsUrls: [
            /.*localhost:8000.*/,
            /.*hair-agenda-backend\.vercel\.app.*/,
            /.*\.supabase\.co.*/
          ],
        },
      }),
    ],
  });

  isTelemetryInitialized = true;
  console.log("[Observability] Grafana Faro initialized.");
};
