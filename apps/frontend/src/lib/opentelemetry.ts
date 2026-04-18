import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { Resource } from '@opentelemetry/resources';

let isTelemetryInitialized = false;

export const initTelemetry = () => {
  if (isTelemetryInitialized) {
    return;
  }

  const endpoint = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT;
  const headersStr = import.meta.env.VITE_OTEL_EXPORTER_OTLP_HEADERS || '';

  if (!endpoint) {
    console.warn("[Observability] OTLP endpoint not found. Telemetry disabled.");
    return;
  }

  // Parse headers from "Key=Value,Key2=Value2" format
  const headers: Record<string, string> = {};
  if (headersStr) {
    headersStr.split(',').forEach((h: string) => {
      const [key, value] = h.split('=');
      if (key && value) {
        headers[key.trim()] = value.trim();
      }
    });
  }

  const provider = new WebTracerProvider({
    resource: new Resource({
      'service.name': import.meta.env.VITE_OTEL_SERVICE_NAME || 'hairagenda-frontend',
      'deployment.environment': import.meta.env.MODE || 'development',
    }),
  });

  const exporter = new OTLPTraceExporter({
    url: endpoint,
    headers: headers,
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        clearTimingResources: true,
        propagateTraceHeaderCorsUrls: [
          /.*localhost:8000.*/,
          /.*hair-agenda-backend\.vercel\.app.*/,
          /.*\.supabase\.co.*/
        ]
      }),
    ],
  });

  isTelemetryInitialized = true;
  console.log("[Observability] OpenTelemetry initialized with endpoint:", endpoint);
};
