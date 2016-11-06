function connect() {
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    //var url = 'mongodb://localhost:27017/localdb';
    var url = 'mongodb://admin:123@ds050189.mlab.com:50189/miedb';
    MongoClient.connect(url, function (err, db) {
        if(err)
        {
           console.log(err);
        }else {
            console.log('connected');
            db.close();
            console.log('disconnected');
        }
    })


}

