import { Logger } from "@medusajs/framework/types"
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import nodemailer, { Transporter } from "nodemailer"
import { renderEmail } from "./templates"

type Options = {
  host: string
  port?: number
  user?: string
  pass?: string
  // "Perfumería Núria Vilalta <pedidos@...>"
  from: string
  storefrontUrl?: string
}

// Sends the shop's emails through any SMTP server: a Gmail account with an app
// password, Brevo or Resend all work on their free plans.
class SmtpEmailService extends AbstractNotificationProviderService {
  static identifier = "smtp"

  protected logger_: Logger
  protected options_: Options
  protected transporter_: Transporter

  constructor({ logger }: { logger: Logger }, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options
    const port = options.port ?? 587
    this.transporter_ = nodemailer.createTransport({
      host: options.host,
      port,
      secure: port === 465,
      auth: options.user ? { user: options.user, pass: options.pass } : undefined,
    })
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.host || !options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The SMTP email provider needs `host` and `from`."
      )
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const { subject, html, text } = renderEmail(notification.template, {
      ...(notification.data ?? {}),
      storefrontUrl: this.options_.storefrontUrl,
    })
    const info = await this.transporter_.sendMail({
      from: notification.from || this.options_.from,
      to: notification.to,
      subject,
      html,
      text,
    })
    this.logger_.info(`Email "${notification.template}" sent to ${notification.to}.`)
    return { id: info.messageId }
  }
}

export default SmtpEmailService
