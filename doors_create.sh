#!/bin/bash
curl -i -X PUT http://localhost:3000/door/red
curl -i -X PUT http://localhost:3000/door/green
curl -i -X PUT http://localhost:3000/door/blue
curl -i -X GET http://localhost:3000/doors
curl -i -X PUT http://localhost:3000/door/red/open
curl -i -X PUT http://localhost:3000/door/green/open
curl -i -X PUT http://localhost:3000/door/blue/open
curl -i -X GET http://localhost:3000/doors
