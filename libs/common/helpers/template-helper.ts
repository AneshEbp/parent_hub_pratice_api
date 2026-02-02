import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import * as rootPath from 'path';

export const generateEmailTemplate = (content: string) => {
  const filePath = rootPath.join(__dirname, `../../../views/templates/email-template.hbs`);
  const emailTemplate = readFileSync(filePath, 'utf8');
  const template = compile(emailTemplate);
  const html = template({ body: content });
  return html;
};

export function replacePlaceholders(htmlTemplate: string, data = []) {
  return htmlTemplate.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || '';
  });
}
