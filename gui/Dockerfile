FROM node:20 as build

WORKDIR /app
COPY ./gui ./gui
COPY ./api ./api
WORKDIR /app/gui

RUN npm ci && npm run grpc && npm run build

FROM nginx:alpine

ARG BUILD_VERSION=0.0.0-development
ARG COMMIT_SHA=NOT_AVAILABLE

LABEL org.opencontainers.image.authors="cbuehler@rootd.ch" \
    org.opencontainers.image.url="https://github.com/WirePact/k8s-contract-repository" \
    org.opencontainers.image.documentation="https://github.com/WirePact/k8s-contract-repository/blob/main/README.md" \
    org.opencontainers.image.source="https://github.com/WirePact/k8s-contract-repository/blob/main/gui/Dockerfile" \
    org.opencontainers.image.version="${BUILD_VERSION}" \
    org.opencontainers.image.revision="${COMMIT_SHA}" \
    org.opencontainers.image.licenses="Apache-2.0" \
    org.opencontainers.image.title="WirePact Contract Repository GUI" \
    org.opencontainers.image.description="GUI for the WirePact contract repository. Manages contracts between PKIs in WirePact to allow distributed authentication. Interacts with the API to provide a convenient way to manage contracts."

ENV PORT=80

COPY --from=build /app/gui/dist/* /usr/share/nginx/html/
COPY ./gui/nginx.conf /etc/nginx/templates/default.conf.template
COPY ./gui/25-set-dns-server.sh /docker-entrypoint.d/25-set-dns-server.sh
RUN chmod +x /docker-entrypoint.d/25-set-dns-server.sh
