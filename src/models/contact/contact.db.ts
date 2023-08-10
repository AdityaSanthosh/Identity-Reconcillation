import { Contact } from '@server/models/contact/contact.interface';
import { parseContact } from '@server/models/contact/contact.utils';
import {LinkPrecendence, Prisma} from "@prisma/client";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @ts-ignore
export async function createContact(data): Promise<Contact> {
    try {
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
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // The .code property can be accessed in a type-safe manner
            if (e.code === 'P2002') {
                return parseContact(await getContactbyEmailandPhoneNumber(data.email, data.phoneNumber));
            }
        }
    }
}

export async function getContactById(id): Promise<Contact> {
    return parseContact(await prisma.contact.findUnique({
        where: {id},
    }));
}

export async function updateContact(id, data) {
    return await prisma.contact.update({
        where: {id},
        data: {
            linkedId: data.linkedId,
            linkPrecedence: data.linkPrecedence,
            updatedAt: new Date(),
        },
    });
}

export async function getSecondaryContacts(id): Promise<Contact[]> {
    let contacts = await prisma.contact.findMany({
        where: {
            linkedId: id
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
    return contacts.map(contact=>parseContact(contact));
}

export async function getContactbyEmailandPhoneNumber(email: string, phoneNumber: string): Promise<Contact> {
    return prisma.contact.findFirst({
        where: {
            email,
            phoneNumber,
        },
    });
}

export async function makeSecondary(linkedId, targetLinkedId) {
    if(linkedId!==targetLinkedId) {
        await prisma.contact.updateMany({
            where: {
                linkedId
            },
            data: {
                linkedId: targetLinkedId,
                linkPrecedence: LinkPrecendence.secondary
            }
        })
    }
}