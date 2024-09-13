FROM flyway/flyway:9.22.3-alpine

ENTRYPOINT []
USER root
RUN apk add --update --no-cache python3
RUN apk add --update --no-cache postgresql
COPY flyway/sql /flyway/sql/
COPY flyway/apply_migrations.py /apply_migrations.py

CMD ["python3", "/apply_migrations.py"]
