import {ContactResponse} from "@server/models/contact/contact.interface";
import {convertContact} from "@server/models/contact/contact.utils";

export function identify(email, phoneNumber): ContactResponse {
    return convertContact();
}