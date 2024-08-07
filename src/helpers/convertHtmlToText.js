const { htmlToText } = require("html-to-text");

const convertHtmlToText = (html) => {
  return htmlToText(html, {
    wordwrap: false,
    ignoreImage: true,
    noLinkBrackets: true,
  });
};

module.exports = convertHtmlToText;
