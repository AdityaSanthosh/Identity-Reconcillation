import { Contact } from '@server/models/contact/contact.interface';
import { parseContact } from '@server/models/contact/contact.utils';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function createContact(data): Promise<Contact> {
    const contact = await prisma.contact.create({
      data: {
        phoneNumber: data.phoneNumber || null,
        email: data.email || null,
        linkedId: data.linkedId || null,
        linkPrecedence: data.linkPrecedence || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return parseContact(contact);
}

export async function getContactById(id): Promise<Contact> {
    return prisma.contact.findUnique({
        where: {id},
    });
}

export async function updateContact(id, data) {
    return prisma.contact.update({
        where: {id},
        data: {
            phoneNumber: data?.phoneNumber,
            email: data?.email,
            linkedId: data?.linkedId,
            linkPrecedence: data?.linkPrecedence,
            updatedAt: new Date(),
        },
    });
}


export async function isDuplicateContact(email,phoneNumber): Promise<boolean> {
    return !!await prisma.contact.findFirst({
        where: {email, phoneNumber},
    });
}

export async function getSecondaryContacts(id): Promise<Contact[]> {
    return await  prisma.contact.findMany({
        where: {
            linkedId: id
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
}