#!/usr/bin/env bash

mkdir -p /etc/systemd/system/docker.service.d

echo "# /etc/systemd/system/docker.service.d/override.conf
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://127.0.0.1:2376" >> /etc/systemd/system/docker.service.d/startup_options.conf

systemctl daemon-reload

systemctl restart docker.service
