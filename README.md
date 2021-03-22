## Run

#### With Docker

```shell
git clone https://github.com/donthi/bussr-assesment.git
cd bussr-assesment
docker-compose up
```

It will expose port 3000.
Server running on http://0.0.0.0:3000

#### Swagger Document

swagger document can be accessed at http://0.0.0.0:3000/documentation

#### Running Tests

```shell
npm install
npm test
```

#### Example access token header

```json
{
  "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.GQIdMj0gO4DCPcon_oRn1nFMjfGzA4sOPRIIhRRorLs"
}
```
