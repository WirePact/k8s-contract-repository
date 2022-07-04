FROM node:16 as build

WORKDIR /app
COPY ./gui ./gui
COPY ./api ./api
WORKDIR /app/gui

RUN npm ci && npm run grpc && npm run build

FROM nginx:alpine

ENV PORT=80

COPY --from=build /app/gui/dist/* /usr/share/nginx/html/
COPY ./gui/nginx.conf /etc/nginx/templates/default.conf.template
COPY ./gui/nginx.sh /nginx.sh
RUN chmod +x /nginx.sh

CMD [ "/nginx.sh" ]
