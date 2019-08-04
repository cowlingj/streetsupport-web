FROM node:latest

EXPOSE 3000

RUN useradd -m -d /home/app -s /bin/bash app
RUN chown -R app /home/app
USER app

RUN npm config set prefix /home/app/.local
ENV PATH="/home/app/.local/bin:${PATH}"
RUN npm install --global gulp-cli

# TODO: only copy _dist
COPY / /home/app/

WORKDIR /home/app

RUN npm install
ENTRYPOINT [ "gulp" ]
