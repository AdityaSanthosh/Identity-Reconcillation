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
    // Don't create a new contact. Since there is a Unique Phone & Email db check, alternate implementation is throwing this from
    // createContact function
    if(existingPhoneContact && existingEmailContact && existingEmailContact.id===existingPhoneContact.id) {
        return existingPhoneContact;
    }
    if(existingPhoneContact && existingEmailContact && existingEmailContact.id!==existingPhoneContact.id) {
        const [oldest_contact, recent_contact] =
            existingPhoneContact.createdAt < existingEmailContact.createdAt
                ? [existingPhoneContact, existingEmailContact]
                : [existingEmailContact, existingPhoneContact];
        await updateContact(recent_contact.id,{linkPrecedence:LinkPrecendence.secondary, linkedId: oldest_contact.id});
    }
    let linkPrecedence;
    let linkedId;
    // No Existing Contact found, create a new contact
    if(!existingPhoneContact && !existingEmailContact) {
        linkPrecedence = LinkPrecendence.primary;
    }
    // If either phoneNumber or Email is found, get the primary contact
    // and make its id as the linkedId of the newly created contact with linkPrecedence Secondary
    if(existingPhoneContact || existingEmailContact) {
        let firstIdentifiedId = existingPhoneContact?.id || existingEmailContact?.id;
        let firstIdentifiedContact = await getContactById(firstIdentifiedId);
        let primaryContact = firstIdentifiedContact.linkPrecedence === LinkPrecendence.secondary ? await getContactById(firstIdentifiedContact.linkedId) : firstIdentifiedContact;
        linkedId = primaryContact.id;
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
    let data;
    if(contact.linkPrecedence === LinkPrecendence.secondary) {
        contact = await getContactById(contact.linkedId);
        const allContacts = await getSecondaryContacts(contact.id);
        const secondaryContactIds = allContacts.map(contact => contact.id);
        allContacts.unshift(contact);
        data = {
            primaryContactId: contact.id,
            emails: allContacts.map(contact => contact.email),
            phoneNumbers: allContacts.map(contact => contact.phoneNumber),
            secondaryContactIds,
        }
    }
    else {
        data = {
            primaryContactId: contact.id,
            emails: contact?.email,
            phoneNumbers: contact?.phoneNumber,
            secondaryContactIds: null,
        }
    }
    return convertContact(data);
}