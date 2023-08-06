import express from 'express';
const verify = express.Router();

verify.get('/hello', async (req, res) => {
    try {
        console.log("in");
    return res.send('hello world');
} catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Internal server error' });
  }
});


verify.get('/verifyDB', async (req, res) => {
    try {
        console.log("in");
    return res.send('hello world');
} catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Internal server error' });
  }
});

export default verify;