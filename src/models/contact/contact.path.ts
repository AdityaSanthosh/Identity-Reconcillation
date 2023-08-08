import {Contact} from "@server/models/contact/contact.interface";
import {createContact, getContactById, updateContact} from "@server/models/contact/contact.db";
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

export async function create(email, phoneNumber): Promise<Contact> {
    let existingEmailContact;
    let existingPhoneContact;
    let contact: Contact;
    if(email) {
         existingEmailContact = await prisma.contact.findFirst({
            where: {
                email,
            },
             orderBy: {
                createdAt: 'asc'
             }
        });
    }
    if(phoneNumber) {
        existingPhoneContact = await prisma.contact.findFirst({
            where: {
                phoneNumber,
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }
    if(!existingPhoneContact && !existingEmailContact) {
        let new_contact = {
            phoneNumber,
            email,
            linkPrecedence: "primary",
        }
        contact = await createContact(new_contact)
    }
    if(existingPhoneContact && existingEmailContact && existingEmailContact!=existingPhoneContact) {
        const [oldest_contact, recent_contact] =
            existingPhoneContact.createdAt < existingEmailContact.createdAt
                ? [existingPhoneContact, existingEmailContact]
                : [existingEmailContact, existingPhoneContact];
        await updateContact(oldest_contact.id,{linkedPrecedence:"primary"});
        await updateContact(recent_contact.id,{linkedPrecedence:"secondary", linkedId: oldest_contact.id});
        return contact;
    }
    if(existingPhoneContact || existingEmailContact) {
        let firstIdentifiedId = existingPhoneContact?.id || existingEmailContact?.id;
        let firstIdentifiedContact = await getContactById(firstIdentifiedId);
        let linkedId;
        if(firstIdentifiedContact.linkPrecedence === "secondary") {
            linkedId = firstIdentifiedContact.linkedId
        } else {
            linkedId = firstIdentifiedContact.id
        }
        let new_contact = {
            phoneNumber,
            email,
            linkPrecedence: "secondary",
            linkedId,
        }
        contact = await createContact(new_contact)
    }
    return contact;
}

// export function identify(contact: Contact): ContactResponse {
//
// }