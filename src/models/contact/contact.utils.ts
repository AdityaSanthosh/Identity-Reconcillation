import {Contact, ContactResponse} from "@server/models/contact/contact.interface";

export function convertContact(data: any): ContactResponse {
    return {
        primaryContactId: data.primaryContactId,
        emails: data.emails,
        phoneNumbers: data.phoneNumbers,
        secondaryContactIds: data.secondaryContactIds,
    }
}

export function parseContact(data: any): Contact {
    return {
        id: data.id,
        phoneNumber: data?.phoneNumber,
        email: data?.email,
        linkedId: data?.linkedId,
        linkPrecedence: data?.linkPrecedence,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        deletedAt: data?.deletedAt,
    }
}
