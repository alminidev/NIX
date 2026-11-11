#!/bin/sh
# Docker Desktop no WSL expõe o contexto como named pipe. A CLI do Supabase,
# no Linux, fala com o socket Unix.
if [ -z "$DOCKER_HOST" ] && [ -S /var/run/docker.sock ]; then
  export DOCKER_HOST="unix:///var/run/docker.sock"
fi

exec supabase "$@"
