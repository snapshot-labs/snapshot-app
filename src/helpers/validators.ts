export const failedSeedPhraseRequirements = (seed) => {
  const wordCount = seed.split(/\s/u).length;
  return wordCount % 3 !== 0 || wordCount > 24 || wordCount < 12;
};

export const parseVaultValue = async (password, vault) => {
  let vaultSeed;

  if (vault[0] === "{" && vault[vault.length - 1] === "}")
    try {
      const seedObject = JSON.parse(vault);
      if (
        seedObject?.cipher &&
        seedObject?.salt &&
        seedObject?.iv &&
        seedObject?.lib
      ) {
        const encryptor = new Encryptor();
        const result = await encryptor.decrypt(password, vault);
        vaultSeed = result[0]?.data?.mnemonic;
      }
    } catch (error) {
      //No-op
    }
  return vaultSeed;
};

export const parseSeedPhrase = (seedPhrase) =>
  (seedPhrase || "").trim().toLowerCase().match(/\w+/gu)?.join(" ") || "";
