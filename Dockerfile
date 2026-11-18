FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8765

WORKDIR /app

# Create non-root corporate system user
RUN groupadd -r titan && useradd -r -g titan -d /app titan

COPY . /app
RUN mkdir -p /app/corporate_hq/cloud_state /app/corporate_hq/knowledge_vault /app/projects \
    && chown -R titan:titan /app

USER titan

EXPOSE 8765

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request, sys; r = urllib.request.urlopen('http://127.0.0.1:8765/api/health', timeout=3); sys.exit(0 if r.status == 200 else 1)"

CMD ["python", "scripts/command_center_server.py", "--host", "0.0.0.0", "--port", "8765"]
