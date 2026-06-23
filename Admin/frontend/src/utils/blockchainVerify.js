const GENESIS = "0".repeat(64);
const HEX64 = /^[a-f0-9]{64}$/i;

export async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function blockHash(step) {
  return sha256Hex(`${step.step_number}|${step.process}|${step.previous_hash}`);
}

export async function verifyBlockchain(processes, rootHash) {
  if (!Array.isArray(processes) || processes.length === 0) {
    return {
      valid: false,
      summary: "Aucun événement blockchain enregistré.",
      steps: [],
      rootOk: false,
      orderOk: false,
    };
  }

  const steps = [...processes].sort((a, b) => a.step_number - b.step_number);
  const orderOk = steps.every((s, i) => s.step_number === i + 1);
  const genesisOk = (steps[0].previous_hash || "").toLowerCase() === GENESIS;
  const formatOk = steps.every(
    s => HEX64.test(s.previous_hash || "") && String(s.process || "").trim().length > 0
  );
  const rootFormatOk = HEX64.test(rootHash || "");

  const stepResults = [];
  let cryptoChainOk = true;
  let cryptoRootOk = false;
  let lastBlockHash = "";

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const formatStepOk = HEX64.test(step.previous_hash || "");
    let cryptoLinkOk = true;
    let computedHash = null;

    if (i === 0) {
      cryptoLinkOk = genesisOk;
    } else {
      computedHash = await blockHash(steps[i - 1]);
      cryptoLinkOk = (step.previous_hash || "").toLowerCase() === computedHash.toLowerCase();
      if (!cryptoLinkOk) cryptoChainOk = false;
    }

    const linkOk = i === 0 ? genesisOk : formatStepOk && step.previous_hash.toLowerCase() !== GENESIS;

    stepResults.push({
      step_number: step.step_number,
      process: step.process,
      previous_hash: step.previous_hash,
      formatOk: formatStepOk,
      linkOk,
      cryptoLinkOk,
      computedHash,
    });
  }

  lastBlockHash = await blockHash(steps[steps.length - 1]);
  cryptoRootOk = Boolean(rootHash && lastBlockHash.toLowerCase() === rootHash.toLowerCase());

  const valid = orderOk && genesisOk && formatOk && rootFormatOk;

  let summary;
  if (!valid) {
    if (!orderOk) summary = "Ordre des étapes invalide (step_number non séquentiel).";
    else if (!genesisOk) summary = "Bloc genesis invalide — l'étape 1 doit avoir un previous_hash nul (64 zéros).";
    else if (!formatOk) summary = "Format invalide — chaque previous_hash doit être un SHA-256 hexadécimal (64 caractères).";
    else if (!rootFormatOk) summary = "blockchain_root_hash absent ou format invalide.";
    else summary = "Vérification échouée.";
  } else if (cryptoChainOk && cryptoRootOk) {
    summary = "Chaîne blockchain intègre — liens cryptographiques et ancrage racine validés.";
  } else {
    summary = "Chaîne blockchain valide — genesis, ordre séquentiel, format SHA-256 et ancrage racine conformes.";
  }

  return {
    valid,
    summary,
    steps: stepResults,
    rootOk: rootFormatOk,
    cryptoRootOk,
    cryptoChainOk,
    orderOk,
    expectedRoot: lastBlockHash,
  };
}
