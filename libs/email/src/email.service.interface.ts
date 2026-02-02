export interface IEmailService {
  sendEmail({
    email,
    subject,
    template,
  }: {
    email: string;
    subject: string;
    template: string;
  }): Promise<any>;
}
