export class EmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`Sending email to ${to} with subject "${subject}"...`);
    return true;
  }
}
