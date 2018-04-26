var router = require('express').Router();
var db = require('../../../lib/database')();

router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results, fields) => {
        return res.render('admin/users/views/index', { users: results });
    });
});

router.post('/', (req, res) => {
    var queryString = `INSERT INTO \`users\` (\`name\`, \`age\`, \`email\`, \`password\`)
    VALUES("${req.body.name}", ${req.body.age}, "${req.body.email}", "${req.body.password}");`;

    db.query(queryString, (err, results, fields) => {
        if (err) throw err;
        return res.redirect('/admin/users');
    });
});

router.get('/new', (req, res) => {
    res.render('admin/users/views/form');
});

router.get('/:id', (req, res) => {
    db.query(`SELECT * FROM users WHERE id=${req.params.id}`, (err, results, fields) => {
        if (err) throw err;
        res.render('admin/users/views/form', { user: results[0] });
    });
});

router.put('/:id', (req, res) => {
    const queryString = `UPDATE users SET
    name = "${req.body.name}",
    age = ${req.body.age},
    email = "${req.body.email}"
    WHERE id=${req.params.id}`;

    db.query(queryString, (err, results, fields) => {
        if (err) throw err;
        res.redirect('/admin/users');
    });
});

router.get('/:id/remove', (req, res) => {
    db.query(`DELETE FROM users WHERE id=${req.params.id}`, (err, results, fields) => {
        if (err) throw err;
        res.redirect('/admin/users');
    });
});

module.exports = router;