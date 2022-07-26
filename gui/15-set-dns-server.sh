#!/bin/sh

if [ -z "$DNS_SERVER" ] && [ -f "/etc/resolv.conf" ]; then
    echo "DNS SERVERS variable not set and resolv conf file found"
    export DNS_SERVER=$(awk 'BEGIN{ORS=" "} $1=="nameserver" {print $2}' /etc/resolv.conf)
    echo "DNS SERVERS: $DNS_SERVER"
fi
