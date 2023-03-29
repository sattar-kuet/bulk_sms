-1. npm install express --save
2. npm install axios --save
3. npm install serialport-gsm --save
4. npm install pm2 -g
5. https://pm2.keymetrics.io/
6. pm2 start marketing.js
7. pm2 monit
8. pm2 stop 0
9. pm2 delete 0

Restart:
1. CTRL + C
2  pm2 stop 0
3. pm2 delete 0
4. pm2 start marketing.js
5. pm2 monit
