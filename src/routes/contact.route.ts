import express from 'express';
import {create, identify} from "@server/models/contact/contact.path";

const defaultRouter = express.Router();

defaultRouter.post('/identify', async (req, res) => {
    if (!req.body.hasOwnProperty('email') && !req.body.hasOwnProperty('phoneNumber')) {
        res.json({message: 'Either phoneNumber or email should be present in the request'});
        return;
    }
    const email = req.body.email || null;
    const phoneNumber = req.body.phoneNumber || null;
    let contactResponse = await identify(await create(email, phoneNumber));
    res.status(200).json({contact: contactResponse});
});

export default defaultRouter;
