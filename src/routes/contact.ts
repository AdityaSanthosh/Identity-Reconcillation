import express from 'express';

const defaultRouter = express.Router();

defaultRouter.get('/identify', (_req, res) => {
    res.json({ message: 'API data response' });
});

export default defaultRouter;
