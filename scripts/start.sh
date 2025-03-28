#!/bin/bash
cd /home/ec2-user/app
nohup node server.js > app.log 2>&1 &
