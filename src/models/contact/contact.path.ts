import {
  Contact,
  ContactResponse,
} from '@server/models/contact/contact.interface';
import {
    createContact,
    getContactById, getSecondaryContacts,
    updateContact,
} from '@server/models/contact/contact.db';
import {LinkPrecendence, PrismaClient} from '@prisma/client';
import {convertContact} from "@server/models/contact/contact.utils";

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
        await updateContact(oldest_contact.id,{linkPrecedence:LinkPrecendence.primary});
        await updateContact(recent_contact.id,{linkPrecedence:LinkPrecendence.secondary, linkedId: oldest_contact.id});
        return oldest_contact;
    }
    let linkPrecedence;
    let linkedId;
    if(!existingPhoneContact && !existingEmailContact) {
        linkPrecedence = LinkPrecendence.primary;
    }
    if(existingPhoneContact || existingEmailContact) {
        let firstIdentifiedId = existingPhoneContact?.id || existingEmailContact?.id;
        let firstIdentifiedContact = await getContactById(firstIdentifiedId);
        let primaryContact = firstIdentifiedContact.linkPrecedence === LinkPrecendence.secondary ? await getContactById(firstIdentifiedContact.linkedId) : firstIdentifiedContact;
        linkedId = primaryContact.id;
        await updateContact(linkedId,{linkPrecedence: LinkPrecendence.primary});
        linkPrecedence = LinkPrecendence.secondary
    }
    let new_contact = {
        phoneNumber,
        email,
        linkPrecedence,
        linkedId,
    }
    return await createContact(new_contact);
}

export async function identify(contact: Contact): Promise<ContactResponse> {
    const allContacts = await getSecondaryContacts(contact.id);
    console.log(contact, allContacts);
    if(!allContacts.length) {
        const data = {
            primaryContactId: contact.id,
            emails: contact?.email,
            phoneNumbers: contact?.phoneNumber,
            secondaryContactIds: null,
        }
        return convertContact(data);
    }
    const secondaryContactIds = allContacts.map(contact => contact.id);
    allContacts.unshift(contact);
    const data = {
        primaryContactId: contact.id,
        emails: allContacts.map(contact => contact.email),
        phoneNumbers: allContacts.map(contact => contact.phoneNumber),
        secondaryContactIds,
    }
    return convertContact(data);
}