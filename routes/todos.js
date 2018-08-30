var express = require('express');
var router = express.Router();
var mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1111',
  //database: 'tododb'
});

// connection.connect(function (err) {
//   if (err) throw err;
// });

// connection.query('DROP DATABASE IF EXISTS tododb', function (err, rows, fields) {
//   if (err) throw err
// })

connection.query('CREATE DATABASE IF NOT EXISTS tododb', function (err, rows, fields) {
  if (err) throw err
})

connection.query('USE tododb', function (err, rows, fields) {
  if (err) throw err
})

// const sqldrop = "DROP TABLE IF EXISTS todolist";
// connection.query(sqldrop, function (err, result) {
//   if (err) throw err;
// });

// const sqldrop2 = "DROP TABLE IF EXISTS tasks";
// connection.query(sqldrop2, function (err, result) {
//   if (err) throw err;
// });

const sqlcreatetodolist = "CREATE TABLE IF NOT EXISTS todolist (idkey SMALLINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT, id VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, KEY(id))";
connection.query(sqlcreatetodolist, function (err, result) {
  if (err) throw err;
});

const sqlcreatetasks = "CREATE TABLE IF NOT EXISTS tasks (idkey SMALLINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT, id VARCHAR(50) NOT NULL, text VARCHAR(255), listid VARCHAR(50), KEY(listid) )";
connection.query(sqlcreatetasks, function (err, result) {
  if (err) throw err;
});

// connection.query('SHOW TABLES', function (err, rows, fields) {
//   if (err) throw err
//   console.log(rows);
// })

// connection.query('DESCRIBE todolist', function (err, rows, fields) {
//   if (err) throw err
//   console.log(rows)
// })

// connection.query('DESCRIBE tasks', function (err, rows, fields) {
//   if (err) throw err
//   console.log(rows)
// })


//connection.end()

// const sqlinsert = "INSERT INTO todolist (id, title) VALUES ('76e4f98a-59aa-47bd-aef0-ab89a4124043', 'List 1')," +
//   "('7973d567-dba1-452b-8468-ef27d3138fae', 'List 2')";

// connection.query(sqlinsert, function (err, result) {
//   if (err) throw err;
// });


// const sqlinsert2 = "INSERT INTO tasks (id, text, listid) VALUES ('4fd8e95b-2d2c-4bc3-8082-f121c2a8ad3e', 'Do things', '76e4f98a-59aa-47bd-aef0-ab89a4124043')," +
//   "('cf704615-c7df-45f8-89ba-23995770cecc', 'Do 2 things', '76e4f98a-59aa-47bd-aef0-ab89a4124043')";
// connection.query(sqlinsert2, function (err, result) {
//   if (err) throw err;
// });



asyncQuery = (query, args) => {
  return new Promise((resolve, reject) => {
    connection.query(query, function (err, result, fields) {
      if (err)
        return reject(err);
      resolve(result);
    });
  });
}

router.get('/', function (req, res, next) {
  let todolist, tasks;

  asyncQuery('SELECT id, title FROM todolist')
    .then(rows => {
      todolist = rows;
      return asyncQuery('SELECT id, text, listid FROM tasks');
    })
    .then(rows => {
      tasks = rows;
    })
    .then(() => {

      for (i = 0; i < todolist.length; i++) {
        todolist[i].tasks = [];
      }

      for (i = 0; i < todolist.length; i++) {
        for (j = 0; j < tasks.length; j++) {
          if (todolist[i].id === tasks[j].listid)
            todolist[i].tasks.push({ id: tasks[j].id, text: tasks[j].text });
        }
      }

      res.send(todolist);
    });
});

router.post('/', function (req, res) {
  const title = req.body.title;
  const id = req.body.id;
  const tasks = req.body.tasks;

  asyncQuery(`INSERT INTO todolist (id, title) VALUES("${id}", "${title}")`)
    .then(() => {
      tasks.forEach(element => {
        asyncQuery(`INSERT INTO tasks (id, text, listid) VALUES("${element.id}", "${element.text}", "${id}")`);
      });
    })

  res.json();
});

router.put('/', (req, res) => {
  const title = req.body.title;
  const id = req.body.id;
  const tasks = req.body.tasks;

  asyncQuery(`DELETE FROM tasks WHERE listid LIKE "%${id}%"`)
    .then(() => {
      tasks.forEach(element => {
        asyncQuery(`INSERT INTO tasks (id, text, listid) VALUES("${element.id}", "${element.text}", '${id}')`);
      });
    })
    .then(() => {
      asyncQuery(`UPDATE todolist SET title = "${title}" WHERE id LIKE "%${id}%"`);
    })

  res.json();
});

router.delete('/', function (req, res) {
  const id = req.body.id;

  asyncQuery(`DELETE FROM todolist WHERE id LIKE '%${id}%'`)
    .then(() => {
      asyncQuery(`DELETE FROM tasks WHERE listid LIKE '%${id}%'`)
    })

  res.json();
});

module.exports = router;
