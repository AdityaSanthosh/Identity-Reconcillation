import express from 'express';
import {create, identify} from "@server/models/contact/contact.path";
import {isDuplicateContact} from "@server/models/contact/contact.db";

const defaultRouter = express.Router();

defaultRouter.post('/identify', async (req, res) => {
    if (!req.body.hasOwnProperty('email') && !req.body.hasOwnProperty('phoneNumber')) {
        res.json({message: 'Either phoneNumber or email should be present in the request'});
        return;
    }
    const email = req.body.email || null;
    const phoneNumber = req.body.phoneNumber || null;
    if (await isDuplicateContact(email, phoneNumber)) {
        res.status(403).json({message: 'Contact with this email and phoneNumber already exists'});
        return;
    }
    let contactResponse = await identify(await create(email, phoneNumber));
    res.status(200).json({contact: contactResponse});
});

export default defaultRouter;
