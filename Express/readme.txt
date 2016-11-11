 - to run this application use: -Node server.js or npm start, You will see this messages
    (1) Server started on port: 3000
    (2) DB connected on: mongodb://admin:123@ds050189.mlab.com:50189/miedb
 - Point your browser to localhost:3000
 - You can login using default credentials username: admin, password: 123
 - If you make any changes the application server restart automatically (Thanks to "nodemon")
 -Enjoy!



 Create Local DB:

 use mydb
 db.users.insert([
 {
     "id": 2,
     "username": "admin",
     "password": "123",
     "displayName": "Nasir Taha Mojmmed",
     "emails": [
         {
             "value": "Nasir.Saleh@student.fh-kiel.de"
         }
     ],
     "email": "Nasir.Saleh@student.fh-kiel.de"
 },
 {
     "id": 2,
     "username": "Mama",
     "password": "123",
     "displayName": "Nasir Taha Mojmmed",
     "emails": [
         {
             "value": "Mama@student.fh-kiel.de"
         }
     ],
     "email": "Mama@student.fh-kiel.de"
 },
 {
     "id": 2,
     "username": "Baba",
     "password": "123",
     "displayName": "Baba Baba",
     "emails": [
         {
             "value": "Baba@student.fh-kiel.de"
         }
     ],
     "email": "Baba@student.fh-kiel.de"
 }
 ])