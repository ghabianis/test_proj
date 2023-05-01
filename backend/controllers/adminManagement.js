const { validationResult } = require('express-validator');

const Visit = require('../models/visit');
const db = require('../util/database');

exports.fetchAll = async (req, res, next) => {
  try {
    const [allPosts] = await Post.fetchAll();
    res.status(200).json(allPosts);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.absences =async (req, res) => {
  try {
    const query = 'SELECT userId, COUNT(*) as nbabsence FROM absence GROUP BY userId';
    const result = await db.query(query);
     return res.json({data:result[0]});
  } catch (err) {
    res.status(500).send('Server error');
  }
}


exports.allabsences =async (req, res) => {
  try {
    const query = 'SELECT COUNT(*) as nbtotal FROM absence';
    const result = await db.query(query);
     return res.json({data:result[0]});
  } catch (err) {
    res.status(500).send('Server error');
  }
}



exports.monthly = async (req, res) => {
  try {
    const query = `
    SELECT
    DATE_FORMAT(date_absence, '%M') AS monthabs,
    COUNT(*) AS nbuser
  FROM
    absence
  GROUP BY
    DATE_FORMAT(date_absence, '%M');
  
    `;
    const result = await db.query(query);
    return res.json(result[0]);

  } catch (err) {
    res.status(500).send('Server error');
  }
}


exports.visitcount =async (req, res) => {
  try {
    const query = 'SELECT COUNT(*) as nbvisit FROM visite ';
    const result = await db.query(query);
     return res.json(result[0]);
  } catch (err) {
    res.status(500).send('Server error');
  }
}

exports.userscount = async (req, res) => {
  try {
    const query = 'SELECT COUNT(*) as nbuser FROM users ';
    const result = await db.query(query);
    
    return res.json({data:result[0][0]});
  } catch (err) {
    res.status(500).send('Server error');
  }
}



exports.getAllData = async (req, res) => {
  try {
    const promises = [
      db.query('SELECT userId, COUNT(*) as nbabsence FROM absence GROUP BY userId'),
      db.query('SELECT COUNT(*) as nbtotal FROM absence'),
      db.query(`
        SELECT
          DATE_FORMAT(date_absence, '%M') AS monthabs,
          COUNT(*) AS nbuser
        FROM
          absence
        GROUP BY
          DATE_FORMAT(date_absence, '%M')
      `),
      db.query('SELECT COUNT(*) as nbvisit FROM visite'),
      db.query('SELECT COUNT(*) as nbuser FROM users')
    ];

    const [absences, allabsences, monthly, visitcount, userscount] = await Promise.all(promises);

    const data = {
      absences: absences[0],
      allabsences: allabsences[0][0],
      monthly: monthly[0],
      visitcount: visitcount[0][0],
      userscount: userscount[0][0]
    };

    return res.json({ data });
  } catch (err) {
    res.status(500).send('Server error');
  }
}




exports.postPost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) return;

  const title = req.body.title;
  const body = req.body.body;
  const user = req.body.user;

  try {
    const post = {
      title: title,
      body: body,
      user: user,
    };
    const result = await Post.save(post);
    res.status(201).json({ message: 'Posted!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const deleteResponse = await Post.delete(req.params.id);
    res.status(200).json(deleteResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteVisit = async (req, res, next) => {
  try {
    const deleteResponse = await db.query('DELETE FROM visite WHERE id = ?',req.params.id);
    res.status(200).json(deleteResponse,"deleted successfully");
  } catch (err) {
     return err;
  }
};


exports.getallvisits = async (req, res) => {
  try {
    const query = 'SELECT * FROM visite';
    const result = await db.query(query);
    const visits = result[0].map((visit) => ({
      id:visit.id,
      nom: visit.nom,
      prenom: visit.prenom,
      date_arrivee: visit.date_arrivee,
      raison:visit.raison

    }));
    return res.json({...visits});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
  }
};




exports.createvisit = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) return;

  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const date_arrivee = req.body.date_arrivee;
  const raison = req.body.raison;
  try {
    const visit = {
      nom: nom,
      prenom: prenom,
      date_arrivee: date_arrivee,
      raison: raison,
    };
    const result = await Visit.save(visit);
    res.status(201).json({ message: 'visite ajoutée!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
