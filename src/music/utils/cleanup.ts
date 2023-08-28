function cleanUpTitle(str: string) {
  const words = ["music", "video", "lyrics", "vevo", "topic", "feat"];

  return cleanUp(str, words);
}

function cleanUpAuthor(str: string) {
  const words = ["vevo", "topic", "lyrics"];

  return cleanUp(str, words);
}

export function cleanUpSong(title: string, author?: string) {
  return [cleanUpTitle(title), author && cleanUpAuthor(author)]
    .filter(Boolean)
    .join(" ");
}

function cleanUp(str: string, words: string[]) {
  return str
    .replaceAll(/[^a-z0-9]/gi, " ")
    .trim()
    .split(" ")
    .filter((w) => w !== "" && !words.includes(w.toLowerCase()))
    .join(" ");
}
