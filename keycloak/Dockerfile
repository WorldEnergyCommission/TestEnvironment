FROM maven:latest
COPY keycloak/opt-qr-rest .
RUN mvn clean package

FROM quay.io/keycloak/keycloak:22.0.4 as builder

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_FEATURES=token-exchange
ENV KC_DB=postgres
ENV KC_HTTP_RELATIVE_PATH=/auth
COPY --from=0 /target/com.efficientio-opt-qr-rest.jar /opt/keycloak/providers/
RUN /opt/keycloak/bin/kc.sh build
COPY keycloak/themes/ /opt/keycloak/themes/
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "--spi-login-protocol-openid-connect-legacy-logout-redirect-uri=true", "start", "--optimized"]
