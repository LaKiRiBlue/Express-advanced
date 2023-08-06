import mysql from 'mariadb';

const pool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'kiri',
    password: 'kiri',
    database: 'lokkeroom',
  });

  export default pool;
