
# Docker ARM32 (RaspberriPi)


Install Docker:

```
sudo apt install apt-transport-https ca-certificates software-properties-common -y
curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh
sudo usermod -aG docker pi
```

[More info](https://blog.docker.com/2019/03/happy-pi-day-docker-raspberry-pi/)


Install Docker Compose:

```
sudo pip3 install docker-compose
```

Download images:

```
docker pull dimianstudio/minio-arm
docker pull arm32v7/python:3.6
docker pull arm32v7/nginx:1.17
```
