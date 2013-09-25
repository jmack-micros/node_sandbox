#!/bin/bash
cd first
./node_modules/forever/bin/forever start app.js
cd ../second
./node_modules/forever/bin/forever start app.js
cd ..


