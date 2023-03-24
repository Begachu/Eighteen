FROM nginx:alpine

COPY nginx-conf/default.conf /etc/nginx/conf.d/default.conf
