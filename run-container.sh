#!/bin/bash

# arquivo de exemplo para iniciar o container
export SOURCE_DIR='/home/jordan-eokoe/Projetos/Twitter-Chatbot'
export DATA_DIR='/tmp/twitter-chatbot/data/'

# confira o seu ip usando ifconfig docker0|grep 'inet addr:'
export DOCKER_LAN_IP=$(ifconfig docker0 | grep 'inet addr:' | awk '{ split($2,a,":"); print a[2] }')

# porta que será feito o bind
export LISTEN_PORT=5000

docker run --name renova \
 -v $SOURCE_DIR:/src -v $DATA_DIR:/data \
 -p $DOCKER_LAN_IP:$LISTEN_PORT:5049 \
 --cpu-shares=512 \
 --memory 1800m -dit --restart unless-stopped appcivico/twitter-chatbot

 
