// const mongoose = require('mongoose');
// require('dotenv').config();

// class Database {
//     constructor() {
//         this.connection = null;
//     }

//     connect () {
//         console.log('데이터베이스 연결중...');

//         mongoose.connect(process.env.MONGO_URL, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         }).then(()=>{
//             console.log('데이터베이스 연결 완료');
//             this.connection = mongoose.connection;
//         }).catch(error => {
//             console.error(error);
//         });
//     }
// }

// module.exports = Database;