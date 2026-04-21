import { CreateUserDto } from "@/app/_types/user";
import { prisma } from "@/services/database/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const dto: CreateUserDto = await req.json();

  const userExists = await prisma.user.findFirst({
    where: {
      email: dto.email,
    },
  });

  if (userExists) {
    return NextResponse.json(
      {
        error: "User already exists",
      },
      { status: 409 },
    );
  }

  const newUser = await prisma.user.create({
    data: dto,
  });

  const { id: _, ...responseUser } = newUser;

  const response = JSON.stringify(responseUser);

  return NextResponse.json(
    {
      user: JSON.parse(response),
    },
    { status: 201 },
  );
}
