export async function importAccountFromPrivateKey(
  privateKey: string,
  keyringController: any
) {
  // Import private key
  let pkey = privateKey;
  // Handle PKeys with 0x
  if (pkey.length === 66 && pkey.substr(0, 2) === "0x") {
    pkey = pkey.substr(2);
  }
  return keyringController.importAccountWithStrategy("privateKey", [pkey]);
}
