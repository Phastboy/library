"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationEmailContent = exports.generateEmailTemplate = void 0;
const generateEmailTemplate = (content) => `
  <body style="font-family: Arial, sans-serif; text-align: center;">
    ${content}
  </body>
`;
exports.generateEmailTemplate = generateEmailTemplate;
const generateVerificationEmailContent = (verificationLink) => (0, exports.generateEmailTemplate)(`
  <h1>Welcome to MyLibrary!</h1>
  <p>Please click the button below to verify your email address</p>
  <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
    <button style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none;">
      Verify Email
    </button>
  </a>
`);
exports.generateVerificationEmailContent = generateVerificationEmailContent;
//# sourceMappingURL=mail.helpers.js.map