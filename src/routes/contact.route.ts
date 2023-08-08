import express from 'express';
import {identify} from "@server/models/contact/contact.path";

const defaultRouter = express.Router();

defaultRouter.post('/identify', (req, res) => {
    if(!req.body.hasOwnProperty('email') && !req.body.hasOwnProperty('phoneNumber')) {
        res.json({message: 'Either phoneNumber or email should be present in the request'});
        return;
    }
    const email = req.body.email || null;
    const phoneNumber = req.body.phoneNumber || null;
    let identified_contact = identify(email, phoneNumber)
    res.status(200).json({ contact: identified_contact });
});

export default defaultRouter;
