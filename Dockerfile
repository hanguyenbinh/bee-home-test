FROM node:16.3.0-alpine as builder

ENV NODE_ENV build

WORKDIR /home/node/app


COPY --chown=node:node . /home/node/app

RUN npm ci \
    && npm run build

USER node

# ---

FROM node:16.3.0-alpine as production

ENV NODE_ENV development

WORKDIR /home/node/app
RUN mkdir -p /home/node/app/logs
RUN chmod -R 777 /home/node/app/logs
COPY --from=builder /home/node/app/*.json /home/node/app/
# COPY --from=builder /home/node/app/*.ts /home/node/app/
COPY --from=builder /home/node/app/dist /home/node/app
# COPY --from=builder /home/node/app/static /home/node/app/
COPY --from=builder /home/node/app/config.yaml /home/node/app/
COPY --from=builder /home/node/app/key.pem /home/node/app/
COPY --from=builder /home/node/app/cert.pem /home/node/app/

RUN npm ci
USER node

CMD ["node", "./main.js"]