import {
  Contact,
  ContactResponse,
} from '@server/models/contact/contact.interface';
import {
  createContact,
  getContactbyEmailandPhoneNumber,
  getContactById,
  getSecondaryContacts,
  makeSecondary,
  updateContact,
} from '@server/models/contact/contact.db';
import { LinkPrecendence, PrismaClient } from '@prisma/client';
import {
  convertContact,
  parseContact,
} from '@server/models/contact/contact.utils';

const prisma = new PrismaClient();

function getOldestAndRecent(obj1, obj2) {
    if (!obj1) return { oldest: obj2, recent: null };
    if (!obj2) return { oldest: obj1, recent: null };
    let oldest = obj1.createdAt < obj2.createdAt ? obj1 : obj2;
    let recent = obj1 == oldest ? obj2: obj1;
    return {oldest, recent };
}


export async function create(email, phoneNumber): Promise<Contact> {
    let existingContact = await getContactbyEmailandPhoneNumber(email,phoneNumber)
    if(existingContact) {
        return existingContact;
    }
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
    let linkPrecedence;
    let linkedId;

    // No Existing Contact found, create a new contact
    if(!existingPhoneContact && !existingEmailContact) {
        linkPrecedence = LinkPrecendence.primary;
    }

    if(existingPhoneContact || existingEmailContact) {
        let contacts =
            getOldestAndRecent(existingPhoneContact, existingEmailContact);
        let oldest_contact = contacts.oldest;
        let recent_contact = contacts.recent;
        if(oldest_contact.linkedId) {
            oldest_contact = await getContactById(oldest_contact.linkedId);
        }
        if(recent_contact) {
            if(recent_contact.linkedId) {
                let contact = await getContactById(recent_contact.linkedId);
                await updateContact(contact.id, {linkPrecedence, linkedId: oldest_contact.id});
                await makeSecondary(contact.id, oldest_contact.id);
                if(contact.createdAt < oldest_contact.createdAt) {
                    oldest_contact = contact;
                    recent_contact = contacts.oldest;
                }
            }
        }
        linkedId = oldest_contact.id;
        linkPrecedence = LinkPrecendence.secondary;
        if(recent_contact) {
            await updateContact(parseContact(recent_contact).id, {linkPrecedence,linkedId});
            await makeSecondary(recent_contact.id,linkedId);
        }
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
        const raw_emails = allContacts.map(contact => contact.email);
        const emails = [...new Set(raw_emails)];
        const raw_phoneNumbers = allContacts.map(contact => contact.phoneNumber);
        const phoneNumbers = [...new Set(raw_phoneNumbers)];
        data = {
            primaryContactId: contact.id,
            emails,
            phoneNumbers,
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