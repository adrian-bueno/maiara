![maiara](docs/images/maiara2.png?raw=true)


<p style="font-weight: bold; color: red;">WORK IN PROGRESS</p>


Maiara is a chatbots/assistants building app.


## Requirements (only run apps)

- Docker
- Docker Compose


## Requirements (development)

- Docker
- Docker Compose
- Python 3
- Pipenv
- Node.js


## Enable Docker API

From: https://success.docker.com/article/how-do-i-enable-the-remote-api-for-dockerd

Create a file at __/etc/systemd/system/docker.service.d/startup_options.conf__ with the below contents:

```
# /etc/systemd/system/docker.service.d/override.conf
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://127.0.0.1:2376
```

Reload the unit files:

```
$ sudo systemctl daemon-reload
```

Restart the docker daemon with new startup options:

```
$ sudo systemctl restart docker.service
```


## Start application

### Build images

```
$ chmod +x build-images.sh
$ ./build-images.sh
```

Start application with:

```
$ docker-compose up
```

Or with:
```
$ docker-compose up -d
```

to start in background mode.


Open http://localhost:3080 on your favourite browser.


Stop application with:

```
$ docker-compose down
```

## Webhooks

Telegram and Facebook Messenger only accept HTTPS public endpoints.
You can use tools like ngrok or serveo to create a tunnel from port 9999 to a public HTTPS domain.

**ngrok**

```
$ ngrok http 9999
```

**serveo**

```
$ ssh -R <myassistantname>:443:localhost:9999 serveo.net
```


## AWS EC2 instance

OS: Linux  

Minimum requirements (t2.small):  
- 1 core
- 2 GB RAM
- 10-16 GB SSD/HDD


## License

Each package and application has its own separate license.  
Currently they all use the __MIT__ license.


## Future work

- Improve actual code
- Improve editor-web-app visual design (for touch devices and all screen sizes)
- Unit testing
- E2E testing
- Documentation
- Run multiple assistants (now you can only run 1 at a time)
- Deploy app in the cloud (Kubernetes?)
- Run skills without attatching then to an assistant (for testing purposes)
- Multiple dialog flows per skill
- Handle more chat events, not just text messages
- Add more reply types (images, videos, docs, etc.)
- Add more node actions (JSON API caller and other integrations)
- Add support for other NLU and dialog tools (Rasa)
- CI/CD
- Publish stable packages and apps to npm, pip, Docker Hub
- Add test chat to editor-web-app
- Skill and assistant versioning
- Add users and groups / Authentication / Permissions / Roles / etc.
- Realtime multi-user assistant and skill edition (like Google Docs)
- Skill and assistant sharing (public, groups, other users)
- Skill and assistant forking
- Analytics
- Multi-language editor-web-app

## Brand icon

![maiara](docs/images/brand-isotype.png?raw=true)

I'm using a free icon created by Freepik.

Click [here](https://www.flaticon.com/free-icon/robot_631240) to see the original icon.
