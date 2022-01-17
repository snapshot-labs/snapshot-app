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

export function addressIsSnapshotWallet(address: string, snapshotWallets: string[]) {
  for (let i = 0; i < snapshotWallets.length; i++) {
    const currentWallet = snapshotWallets[i];
    if (currentWallet?.toLowerCase() === address.toLowerCase()) {
      return true;
    }
  }
  return false;
}
