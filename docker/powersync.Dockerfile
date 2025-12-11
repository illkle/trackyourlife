
FROM journeyapps/powersync-service:latest
	
USER root

# 901 is user specified in
# https://hub.docker.com/layers/journeyapps/powersync-service/1.18.1/images/sha256-ff2a9dd9e103b951151d15f8c50898f39d34a5d16948d1842dc8e13a9a72cb89

RUN mkdir -p /config && chown -R 901:901 /config

COPY docker/powersync.yaml /config/powersync.yaml

RUN chmod 644 /config/powersync.yaml

USER 901

ENV POWERSYNC_CONFIG_PATH=/config/powersync.yaml