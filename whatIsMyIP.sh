#!/bin/sh
ip_var=$(ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}')
echo $ip_var
export IP=$ip_var
echo "Call as '. ./whatIsMyIP.sh' to export this IP address as environment variable 'IP'"