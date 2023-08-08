import {Contact} from "@server/models/contact/contact.interface";
import {parseContact} from "@server/models/contact/contact.utils";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function createContact(data): Promise<Contact> {
    const contact = await prisma.Contact.create({
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
    return await prisma.Contact.findUnique({
      where: { id },
    });
}

export function isDuplicateContact(email,phoneNumber): boolean {
    return prisma.$exists.Contact({
        where: { email, phoneNumber },
    });
}

export function getSecondaryContacts(id): Contact[] {
    return prisma.Contact.findMany({
        where: {
            linkedId: id
        },
    });
}