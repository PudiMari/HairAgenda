import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';

export const initTelemetry = () => {
  // OTLP Exporter over HTTP
  const otlpUrl = import.meta.env.VITE_OTLP_URL || (import.meta.env.DEV ? 'http://localhost:4318/v1/traces' : '');
  
  const spanProcessors = [];
  if (otlpUrl) {
    const exporter = new OTLPTraceExporter({ url: otlpUrl });
    spanProcessors.push(new BatchSpanProcessor(exporter));
  }

  const provider = new WebTracerProvider({
    spanProcessors
  });

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
          /.*hair-agenda-backend\.vercel\.app.*/
        ]
      }),
    ],
  });

  console.log("[Observability] OpenTelemetry instrumentations configured.");
};
