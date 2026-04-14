import os
import logging
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.django import DjangoInstrumentor
from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor


class OpenTelemetryLogFilter(logging.Filter):
    def filter(self, record):
        span = trace.get_current_span()
        if span and span.is_recording():
            ctx = span.get_span_context()
            record.trace_id = format(ctx.trace_id, '032x')
            record.span_id = format(ctx.span_id, '016x')
        else:
            record.trace_id = ""
            record.span_id = ""
        return True


def setup_telemetry():
    if os.environ.get("OTEL_PYTHON_DJANGO_INSTRUMENT", "False") != "True":
        return

    # Check if already instrumented to avoid duplicate processors
    if getattr(setup_telemetry, "_is_setup", False):
        return
    setup_telemetry._is_setup = True

    resource = Resource.create({"service.name": "hairagenda-backend"})
    provider = TracerProvider(resource=resource)

    endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "http://jaeger:4317")
    exporter = OTLPSpanExporter(endpoint=endpoint, insecure=True)
    processor = BatchSpanProcessor(exporter)
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)

    DjangoInstrumentor().instrument()
    Psycopg2Instrumentor().instrument()
    RequestsInstrumentor().instrument()
