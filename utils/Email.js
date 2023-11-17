import nodemailer from "nodemailer";
import { htmlToText } from "html-to-text";

export default class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = "dejesusyael1987@gmail.com";
  };

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }

  //Sends the actual email
  async send(subject, body) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }

            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              border-radius: 5px;
              margin-top: 20px;
            }

            h1 {
              color: #333;
            }

            p {
              color: #555;
            }

            .btn {
              display: inline-block;
              padding: 10px 20px;
              background-color: #3498db;
              color: #fff;
              text-decoration: none;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          ${body}
        </body>
      </html>
    `;

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText(html),
      html
    }

    await this.newTransport().sendMail(mailOptions);
  }

  async sendActivationToken() {
    const body = `
      <div class="container">
        <h1>Confirmación de Cuenta</h1>
        <p>Hola ${this.firstName}, ¡Gracias por registrarte en Sciflutter! Para completar tu registro, por favor haz clic en el siguiente enlace:</p>
        <p>
          <a class="btn" href="${this.url}" target="_blank">Confirmar Cuenta</a>
        </p>
        <p>Si no te registraste en nuestro sitio, simplemente ignora este correo electrónico.</p>
      </div>
    `;

    await this.send("Activa tu cuenta de Sciflutter", body);
  }

  async sendActivationToken() {
    const body = `
      <div class="container">
        <h1>Recuperacion de Cuenta</h1>
        <p>Hola ${this.firstName}, Para poder recuperar tu cuenta y cambiar tu contraseña en Sciflutter, por favor haz clic en el siguiente enlace:</p>
        <p>
          <a class="btn" href="${this.url}" target="_blank">Recuperar cuenta</a>
        </p>
        <p>Si no te fuiste tu quien solicito el cambio, simplemente ignora este correo electrónico.</p>
      </div>
    `;

    await this.send("Activa tu cuenta de Sciflutter", body);
  }
}