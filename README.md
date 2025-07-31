# cloud-course-server

## Setup the environment for dev

```bash
    node -v22.13.1
```

## Setup the docker

```bash
    docker build -t cloud-course-server .
```

## Build the container

```bash
    docker run -d -p 3000:3000 --name cloud-course-server -v $(pwd):/app cloud-course-server
```
