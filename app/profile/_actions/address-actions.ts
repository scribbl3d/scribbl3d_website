"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { AddressInput } from "@/types/address";

export async function getAddresses() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  return db.address.findMany({
    where: { userId: session.user.id },
  });
}

export async function addAddress(address: AddressInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  return db.address.create({
    data: {
      ...address,
      userId: session.user.id,
    },
  });
}

export async function updateAddress(id: string, address: AddressInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  return db.address.update({
    where: { id, userId: session.user.id },
    data: address,
  });
}

export async function deleteAddress(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  return db.address.delete({
    where: { id, userId: session.user.id },
  });
}
