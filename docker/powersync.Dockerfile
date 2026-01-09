
FROM journeyapps/powersync-service:1.18.2
USER root

# 901 is user specified in
# https://hub.docker.com/layers/journeyapps/powersync-service/1.18.2/images

RUN mkdir -p /config && chown -R 901:901 /config
COPY docker/powersync.yaml /config/powersync.yaml
RUN chmod 644 /config/powersync.yaml

USER 901
ENV POWERSYNC_CONFIG_PATH=/config/powersync.yaml