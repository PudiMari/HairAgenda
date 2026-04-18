import os
import logging


class OpenTelemetryLogFilter(logging.Filter):
    """
    Injects OpenTelemetry trace/span IDs into log records when available.
    Safe to use even if OpenTelemetry is not instrumented or not installed.
    """
    def filter(self, record):
        try:
            from opentelemetry import trace
            span = trace.get_current_span()
            if span and span.is_recording():
                ctx = span.get_span_context()
                record.trace_id = format(ctx.trace_id, '032x')
                record.span_id = format(ctx.span_id, '016x')
            else:
                record.trace_id = ""
                record.span_id = ""
        except ImportError:
            record.trace_id = ""
            record.span_id = ""
        return True


def setup_telemetry():
    """
    Configures OpenTelemetry tracing. Only runs when OTEL_PYTHON_DJANGO_INSTRUMENT=True.
    All heavy imports are deferred to this function to avoid crashing Django at startup.
    """
    if os.environ.get("OTEL_PYTHON_DJANGO_INSTRUMENT", "False") != "True":
        return

    # Check if already instrumented to avoid duplicate processors
    if getattr(setup_telemetry, "_is_setup", False):
        return
    setup_telemetry._is_setup = True

    try:
        from opentelemetry import trace
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.instrumentation.django import DjangoInstrumentor
        from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor
        from opentelemetry.instrumentation.requests import RequestsInstrumentor

        # The OTLPSpanExporter will automatically use environment variables:
        # OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_HEADERS, etc.
        # For Grafana Cloud, we use the HTTP exporter which is more compatible with their gateway.
        
        resource = Resource.create({
            "service.name": os.environ.get("OTEL_SERVICE_NAME", "hairagenda-backend"),
            "deployment.environment": os.environ.get("ENVIRONMENT", "development")
        })
        
        provider = TracerProvider(resource=resource)
        
        # When endpoint is None, it defaults to the environment variable or localhost:4318
        exporter = OTLPSpanExporter()
        processor = BatchSpanProcessor(exporter)
        provider.add_span_processor(processor)
        trace.set_tracer_provider(provider)

        DjangoInstrumentor().instrument()
        Psycopg2Instrumentor().instrument()
        RequestsInstrumentor().instrument()
        
        logging.getLogger(__name__).info("OpenTelemetry successfully instrumented.")
    except Exception as e:
        logging.getLogger(__name__).warning(
            "OpenTelemetry setup failed: %s", e
        )
