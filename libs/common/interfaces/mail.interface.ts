export interface IMailSender {
  receivers: string[];
  name: string;
  params: undefined;
}

export interface IMailTemplate {
  name: string;
  subject: string;
  text: string;
  html: string;
}
