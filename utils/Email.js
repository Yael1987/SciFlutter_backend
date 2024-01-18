import nodemailer from 'nodemailer'
import { htmlToText } from 'html-to-text'
import pug from 'pug'

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default class Email {
  constructor (user, url) {
    this.to = user.email
    this.firstName = user.name.split(' ')[0]
    this.url = url
    this.from = 'dejesusyael1987@gmail.com'
  }

  newTransport () {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }

  //  Sends the actual email
  async send (subject, template) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    })

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText(html),
      html
    }

    await this.newTransport().sendMail(mailOptions)
  }

  async sendActivationToken () {
    await this.send('Activa tu cuenta de Sciflutter', 'welcome')
  }

  async sendResetToken () {
    await this.send('Recupera tu cuenta de Sciflutter', 'resetPassword')
  }
}
