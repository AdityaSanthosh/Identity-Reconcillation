import {ContactResponse} from "@server/models/contact/contact.interface";

export function convertContact(data: any): ContactResponse {
    return {
        primaryContactId: data.primaryContactId,
        emails: data.emails,
        phoneNumbers: data.phoneNumbers,
        secondaryContactIds: data.secondaryContactIds,
    }
}