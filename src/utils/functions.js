export const calculateReadTime = (content) => {
  const averageReadingSpeed = 150; // word/minute

  if (!content) {
    return 0;
  }

  const textContent = content.replace(/<[^>]+>/g, ""); // clear HTML tags
  const words = textContent.trim().split(/\s+/);
  return Math.ceil(words.length / averageReadingSpeed);
};
