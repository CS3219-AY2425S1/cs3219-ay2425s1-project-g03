[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/bzPrOe11)

# CS3219 Project (PeerPrep) - AY2425S1

## Group: G03

### Note:

- You can choose to develop individual microservices within separate folders within this repository **OR** use
  individual repositories (all public) for each microservice.
- In the latter scenario, you should enable sub-modules on this GitHub classroom repository to manage the
  development/deployment **AND** add your mentor to the individual repositories as a collaborator.
- The teaching team should be given access to the repositories as we may require viewing the history of the repository
  in case of any disputes or disagreements.

## Pre-requisites

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Clone the GitHub repository

```
git clone https://github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g03.git
```

## Getting Started

**Step 1: Copy Environment Configuration File**

To get started, copy the contents of `.env.sample` into a new `.env` file located at the root level of the project.

**Step 2: Build the Docker containers**

Next, run the following command to build the Docker containers.

```bash
docker compose -f compose.yml build --no-cache
```

**Step 3: Start the Docker containers**

Once the build is complete, you can start the Docker containers.

```bash
docker compose -f compose.yml up -d
```

After spinning up the services, you may access the frontend client at `127.0.0.1:4200`. Specifically, you can navigate
to the Question SPA at `127.0.0.1:4200/questions` and the login page at `127.0.0.1/account`.

If you would like to spin up the services in development mode, you may use the following command. This enables hot
reloading and exposes the ports for all microservices.

```bash
docker compose -f compose.yml -f compose.dev.yml up -d
```

| Service               | Port |
|-----------------------|------|
| Frontend              | 4200 |
| API Gateway           | 8080 |
| Question Service      | 8081 |
| User Service          | 8082 |
| Match Service         | 8083 |
| Collaboration Service | 8084 |
| Chat Service          | 8085 |
| History Service       | 8086 |
| Room Service          | 8087 |

**Step 4: Stop the Docker containers**

Once you are done, stop and remove the containers using:

```bash
docker compose down -v
```

Note that this will clear any data stored in volumes associated with the containers. If you would like to keep your
data, you can run the command without the `-v` flag, which will remove the containers but retain the data in the volumes
for future use.