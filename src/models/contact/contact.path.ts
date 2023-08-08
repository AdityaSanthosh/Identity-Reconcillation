import {
  Contact,
  ContactResponse,
} from '@server/models/contact/contact.interface';
import {
  createContact,
  getContactById,
  updateContact,
} from '@server/models/contact/contact.db';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function create(email, phoneNumber): Promise<Contact> {
    const existingEmailContact = email
        ? await prisma.contact.findFirst({
            where: { email },
            orderBy: { createdAt: 'asc' },
        })
        : null;
    const existingPhoneContact = phoneNumber
        ? await prisma.contact.findFirst({
            where: { phoneNumber },
            orderBy: { createdAt: 'asc' },
        })
        : null;
    if(existingPhoneContact && existingEmailContact && existingEmailContact!=existingPhoneContact) {
        const [oldest_contact, recent_contact] =
            existingPhoneContact.createdAt < existingEmailContact.createdAt
                ? [existingPhoneContact, existingEmailContact]
                : [existingEmailContact, existingPhoneContact];
        await updateContact(oldest_contact.id,{linkedPrecedence:"primary"});
        await updateContact(recent_contact.id,{linkedPrecedence:"secondary", linkedId: oldest_contact.id});
        return oldest_contact;
    }
    let linkPrecedence;
    let linkedId;
    if(!existingPhoneContact && !existingEmailContact) {
        linkPrecedence = "primary"
    }
    if(existingPhoneContact || existingEmailContact) {
        let firstIdentifiedId = existingPhoneContact?.id || existingEmailContact?.id;
        let firstIdentifiedContact = await getContactById(firstIdentifiedId);
        linkedId =
            firstIdentifiedContact.linkPrecedence === "secondary"
                ? firstIdentifiedContact.linkedId
                : firstIdentifiedContact.id;
        linkPrecedence = "secondary"
    }
    let new_contact = {
        phoneNumber,
        email,
        linkPrecedence,
        linkedId,
    }
    return await createContact(new_contact);
}

export function identify(contact: Contact): ContactResponse {

}