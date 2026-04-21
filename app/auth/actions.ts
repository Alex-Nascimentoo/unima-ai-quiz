"use server";

import { sendMail } from "@/lib/sendMail";
import { login } from "@/services/auth";
import { prisma } from "@/services/database/prisma";

export async function actionSignIn(email: string) {
  console.log("inside actionSignIn email is: ", email);
  try {
    const user = await prisma.user.findFirst({
      where: { email: email },
    });

    console.log("just found user");

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    console.log("user is: ", user);

    const userToken = Math.floor(1000 + Math.random() * 9000);

    // const userToken = uuidv4();
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: userToken.toString(),
        expires: expiration,
      },
    });

    const html = `
      <h1>Olá, ${user.name ? user.name : ""}</h1>
      <br /> <br />
      <p style="font-size: 18px;">
      Segue abaixo o código para fazer login em sua conta
      </p>
      <br /> <br />
      <strong style="font-size: 24px;font-weight: bold;">${userToken}</strong>
      </a>
    `;

    const response = await sendMail({
      email: "no-reply@localhost.com",
      sendTo: email,
      subject: "Código de Login",
      text: "Texto",
      html,
    });

    if (!response) {
      throw new Error("Ocorreu um erro ao enviar o e-mail");
    }

    return "success";
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }

    console.error("error is: ", error);

    // throw new Error("Ocorreu um erro. Por favor, tente novamente");
    throw new Error(error);
  }
}

export async function checkVerificationToken(
  token: string | null,
  email: string | null,
) {
  console.log(
    "inside checkVerificationToken with token: ",
    token,
    " and email: ",
    email,
  );

  if (!token || !email) {
    return "error";
  }

  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: email,
      },
    });

    if (!verificationToken) {
      return "error";
    }

    if (verificationToken.expires < new Date()) {
      return "error";
    }

    const result = await login(email);

    if (result === "error") {
      return "error";
    }

    await prisma.verificationToken.delete({
      where: {
        token: token,
      },
    });

    return "success";
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }

    return "error";
  }
}
