import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inventoryPath = path.join(root, "evidence/linguistics/linguistic-surface-inventory.v1.json");
const prePath = path.join(root, "evidence/linguistics/linguistics-red-team.pre.v1.json");
const postPath = path.join(root, "evidence/linguistics/linguistics-red-team.post.v1.json");
const verificationPath = path.join(root, "evidence/linguistics/linguistics-verification.v1.json");
const registerPath = path.join(root, "docs/requirements/LINGUISTICS-REGISTER.md");

const expectedAuthority = {
  requestId: "SRC-U-20260831-CHORUS-LING",
  requestSha256: "6f3045c41a3287dcf82d2c8657034dbc968fa26f8afb9d63b438316423be91d3",
  registerId: "CHR-LING-REGISTER",
  catalysisCorpusSha256: "566f7c653142b239c098a0a3a0b628f3a3179535b219a99d889fdd48cc9513af",
  baselineCommit: "4fffddf11a03a2fc84798a3c5343db00fc3135da",
};

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const nonBlank = (value, label) => {
  assert.ok(typeof value === "string" && value.trim().length > 0, `${label} must be a non-blank string`);
};
const assertDigest = (value, label) => assert.match(value, /^[0-9a-f]{64}$/u, `${label} must be a lowercase SHA-256 digest`);
const safeRepositoryPath = (relativePath, label) => {
  nonBlank(relativePath, label);
  assert.ok(!relativePath.includes("\\"), `${label} must use repository-relative POSIX separators`);
  assert.ok(!path.isAbsolute(relativePath), `${label} must be repository-relative`);
  const resolved = path.resolve(root, relativePath);
  assert.ok(resolved.startsWith(`${root}${path.sep}`), `${label} escapes the repository`);
  return resolved;
};

function bindingDigest(files) {
  const aggregate = createHash("sha256");
  for (const file of files) {
    const relative = Buffer.from(file.path, "utf8");
    const pathLength = Buffer.alloc(4);
    const contentLength = Buffer.alloc(8);
    pathLength.writeUInt32BE(relative.byteLength);
    contentLength.writeBigUInt64BE(BigInt(file.content.byteLength));
    aggregate.update(pathLength);
    aggregate.update(relative);
    aggregate.update(contentLength);
    aggregate.update(file.content);
  }
  return aggregate.digest("hex");
}

const [inventoryText, register] = await Promise.all([
  readFile(inventoryPath, "utf8"),
  readFile(registerPath, "utf8"),
]);
const inventory = JSON.parse(inventoryText);

const exactKeys = (value, expected, label) => {
  assert.ok(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  assert.deepEqual(Object.keys(value).sort(), [...expected].sort(), `${label} has missing or unknown keys`);
};

exactKeys(inventory, [
  "schema",
  "inventoryId",
  "version",
  "authority",
  "voiceClasses",
  "channels",
  "disclosurePhases",
  "atoms",
], "inventory");
exactKeys(inventory.authority, [
  "registerId",
  "requestId",
  "requestSha256",
  "catalysisCorpusSha256",
], "authority");

assert.equal(inventory.schema, "chorus.linguistic-surface-inventory.v1");
assert.equal(inventory.inventoryId, "CHR-LING-INVENTORY-001");
assert.equal(inventory.authority.registerId, "CHR-LING-REGISTER");
assert.equal(inventory.authority.requestId, "SRC-U-20260831-CHORUS-LING");
assert.equal(inventory.authority.requestSha256, "6f3045c41a3287dcf82d2c8657034dbc968fa26f8afb9d63b438316423be91d3");
assert.equal(inventory.authority.catalysisCorpusSha256, "566f7c653142b239c098a0a3a0b628f3a3179535b219a99d889fdd48cc9513af");
assert.ok(register.includes(inventory.authority.requestSha256), "inventory request digest is not bound in the register");
assert.ok(register.includes(inventory.authority.catalysisCorpusSha256), "inventory Catalysis digest is not bound in the register");
assert.match(inventory.version, /^\d+\.\d+\.\d+$/);
assert.match(inventory.authority.requestSha256, /^[0-9a-f]{64}$/);
assert.match(inventory.authority.catalysisCorpusSha256, /^[0-9a-f]{64}$/);

const expectedVoiceClasses = ["catalysis", "plain-concept", "plain-utility", "technical-verbatim"];
const expectedChannels = ["visual", "nonvisual", "persisted", "publication", "metadata"];
const expectedPhases = ["always", "pre-completion", "post-completion", "endpoint-entry-gated", "explicit-save-action"];
const expectedSourceKinds = ["browser-metadata", "derived-state", "generated-pack", "published-static", "runtime-event", "serialized-trace", "static-jsx"];
const registerRequirementIds = new Set(
  [...register.matchAll(/^\| `(CHR-LING-[A-Z]+-\d{3})` \|/gmu)].map((match) => match[1]),
);
assert.deepEqual(inventory.voiceClasses, expectedVoiceClasses);
assert.deepEqual(inventory.channels, expectedChannels);
assert.deepEqual(inventory.disclosurePhases, expectedPhases);
assert.ok(Array.isArray(inventory.atoms) && inventory.atoms.length >= 20, "inventory must contain at least twenty bounded surface atoms");

const atomKeys = [
  "id",
  "channel",
  "surface",
  "owner",
  "disclosurePhase",
  "voiceClass",
  "semanticJob",
  "propositions",
  "requirementIds",
  "sourceKind",
  "failureBoundary",
];
const ownerKeys = ["path", "symbol"];
const atomIds = new Set();
const seenChannels = new Set();
const seenVoiceClasses = new Set();
const seenPhases = new Set();

for (const [index, atom] of inventory.atoms.entries()) {
  const label = `atom[${index}]`;
  exactKeys(atom, atomKeys, label);
  exactKeys(atom.owner, ownerKeys, `${label}.owner`);
  assert.match(atom.id, /^CHR-LING-ATOM-[A-Z0-9-]+-\d{3}$/);
  assert.ok(!atomIds.has(atom.id), `duplicate atom id ${atom.id}`);
  atomIds.add(atom.id);
  assert.ok(expectedChannels.includes(atom.channel), `${atom.id} has invalid channel`);
  assert.ok(expectedVoiceClasses.includes(atom.voiceClass), `${atom.id} has invalid voice class`);
  assert.ok(expectedPhases.includes(atom.disclosurePhase), `${atom.id} has invalid disclosure phase`);
  assert.ok(expectedSourceKinds.includes(atom.sourceKind), `${atom.id} has invalid source kind`);
  seenChannels.add(atom.channel);
  seenVoiceClasses.add(atom.voiceClass);
  seenPhases.add(atom.disclosurePhase);
  for (const [field, value] of Object.entries({
    surface: atom.surface,
    ownerPath: atom.owner.path,
    ownerSymbol: atom.owner.symbol,
    semanticJob: atom.semanticJob,
    sourceKind: atom.sourceKind,
    failureBoundary: atom.failureBoundary,
  })) {
    assert.ok(typeof value === "string" && value.trim().length > 0, `${atom.id} has blank ${field}`);
  }
  assert.ok(Array.isArray(atom.propositions) && atom.propositions.length > 0, `${atom.id} lacks propositions`);
  assert.ok(atom.propositions.every((value) => typeof value === "string" && value.trim()), `${atom.id} has a blank proposition`);
  assert.ok(Array.isArray(atom.requirementIds) && atom.requirementIds.length > 0, `${atom.id} lacks governing requirements`);
  assert.equal(new Set(atom.requirementIds).size, atom.requirementIds.length, `${atom.id} repeats a requirement`);
  for (const requirementId of atom.requirementIds) {
    assert.match(requirementId, /^CHR-LING-[A-Z]+-\d{3}$/);
    assert.ok(registerRequirementIds.has(requirementId), `${atom.id} cites missing requirement row ${requirementId}`);
  }
  const resolvedOwner = path.resolve(root, atom.owner.path);
  assert.ok(resolvedOwner.startsWith(`${root}${path.sep}`), `${atom.id} owner escapes the repository`);
  await access(resolvedOwner);
  if (/^[A-Za-z_$][\w$]*$/u.test(atom.owner.symbol)) {
    const ownerSource = await readFile(resolvedOwner, "utf8");
    assert.match(ownerSource, new RegExp(`\\b${atom.owner.symbol}\\b`, "u"), `${atom.id} owner symbol is absent from ${atom.owner.path}`);
  }
}

assert.deepEqual([...seenChannels].sort(), [...expectedChannels].sort(), "inventory does not cover every declared channel");
assert.deepEqual([...seenVoiceClasses].sort(), [...expectedVoiceClasses].sort(), "inventory does not use every voice class");
assert.deepEqual([...seenPhases].sort(), [...expectedPhases].sort(), "inventory does not cover every disclosure phase");

for (const requiredAtomId of [
  "CHR-LING-ATOM-CHOICE-001",
  "CHR-LING-ATOM-CHOICE-003",
  "CHR-LING-ATOM-SAVE-001",
  "CHR-LING-ATOM-SAVE-004",
  "CHR-LING-ATOM-RESEARCH-001",
  "CHR-LING-ATOM-RESEARCH-002",
  "CHR-LING-ATOM-DEBRIEF-001",
  "CHR-LING-ATOM-DEBRIEF-002",
  "CHR-LING-ATOM-DEBRIEF-004",
  "CHR-LING-ATOM-PUBLICATION-001",
]) {
  assert.ok(atomIds.has(requiredAtomId), `inventory omits required surface ${requiredAtomId}`);
}

const byId = new Map(inventory.atoms.map((atom) => [atom.id, atom]));
assert.equal(byId.get("CHR-LING-ATOM-CHOICE-001")?.voiceClass, "catalysis");
assert.equal(byId.get("CHR-LING-ATOM-CHOICE-003")?.voiceClass, "plain-utility");
assert.equal(byId.get("CHR-LING-ATOM-PUBLICATION-001")?.disclosurePhase, "always");

const [preBytes, postBytes, verificationBytes] = await Promise.all([
  readFile(prePath),
  readFile(postPath),
  readFile(verificationPath),
]);
const pre = JSON.parse(preBytes.toString("utf8"));
const post = JSON.parse(postBytes.toString("utf8"));
const verification = JSON.parse(verificationBytes.toString("utf8"));

exactKeys(pre, [
  "schema",
  "recordId",
  "phase",
  "captureDate",
  "authority",
  "sourceBinding",
  "method",
  "failedTest",
  "summary",
  "findings",
], "pre-correction record");
exactKeys(pre.authority, Object.keys(expectedAuthority), "pre-correction authority");
assert.equal(pre.schema, "chorus.linguistics-red-team.v1");
assert.equal(pre.recordId, "linguistics-red-team.pre.v1");
assert.equal(pre.phase, "pre-correction");
assert.match(pre.captureDate, /^\d{4}-\d{2}-\d{2}$/u);
assert.deepEqual(pre.authority, expectedAuthority, "pre-correction authority has drifted");
exactKeys(pre.sourceBinding, ["workingDiffSha256", "files"], "pre-correction source binding");
assertDigest(pre.sourceBinding.workingDiffSha256, "pre-correction working diff");
assert.ok(pre.sourceBinding.files && typeof pre.sourceBinding.files === "object" && !Array.isArray(pre.sourceBinding.files), "pre-correction file binding must be an object");
assert.ok(Object.keys(pre.sourceBinding.files).length > 0, "pre-correction file binding is empty");
for (const [relativePath, digest] of Object.entries(pre.sourceBinding.files)) {
  safeRepositoryPath(relativePath, `pre-correction file ${relativePath}`);
  assertDigest(digest, `pre-correction file ${relativePath}`);
}
exactKeys(pre.method, ["performed", "notPerformed"], "pre-correction method");
assert.ok(Array.isArray(pre.method.performed) && pre.method.performed.length > 0, "pre-correction method lacks performed attacks");
assert.ok(Array.isArray(pre.method.notPerformed) && pre.method.notPerformed.length > 0, "pre-correction method must preserve its unperformed scope");
exactKeys(pre.summary, ["releaseBlocking", "high", "medium", "total", "result", "reason"], "pre-correction summary");
assert.equal(pre.summary.result, "failed");
nonBlank(pre.summary.reason, "pre-correction summary reason");
assert.ok(Array.isArray(pre.findings) && pre.findings.length === 13, "pre-correction record must retain all thirteen findings");

const findingSeverities = ["release-blocking", "high", "medium", "low"];
const expectedPreIds = Array.from({ length: 13 }, (_, index) => `LING-PRE-${String(index + 1).padStart(3, "0")}`);
const preIds = new Set();
for (const [index, finding] of pre.findings.entries()) {
  const label = `pre-correction finding[${index}]`;
  exactKeys(finding, [
    "id",
    "severity",
    "status",
    "title",
    "requirementIds",
    "owner",
    "issue",
    "constraint",
    "observed",
    "reproduction",
    "designDecision",
    "implementation",
    "correction",
    "verification",
  ], label);
  assert.match(finding.id, /^LING-PRE-\d{3}$/u);
  assert.ok(!preIds.has(finding.id), `duplicate pre-correction finding ${finding.id}`);
  preIds.add(finding.id);
  assert.ok(findingSeverities.includes(finding.severity), `${finding.id} has invalid severity`);
  assert.equal(finding.status, "failed", `${finding.id} must remain preserved as a failed pre-correction finding`);
  for (const [field, value] of Object.entries({
    title: finding.title,
    owner: finding.owner,
    issue: finding.issue,
    constraint: finding.constraint,
    observed: finding.observed,
    reproduction: finding.reproduction,
    designDecision: finding.designDecision,
  })) nonBlank(value, `${finding.id}.${field}`);
  assert.ok(Array.isArray(finding.requirementIds) && finding.requirementIds.length > 0, `${finding.id} lacks requirements`);
  assert.equal(new Set(finding.requirementIds).size, finding.requirementIds.length, `${finding.id} repeats a requirement`);
  for (const requirementId of finding.requirementIds) {
    assert.match(requirementId, /^CHR-LING-[A-Z]+-\d{3}$/u);
    assert.ok(registerRequirementIds.has(requirementId), `${finding.id} cites missing requirement row ${requirementId}`);
  }
}
assert.deepEqual([...preIds].sort(), expectedPreIds, "pre-correction finding IDs have drifted");
assert.equal(pre.summary.releaseBlocking, pre.findings.filter((finding) => finding.severity === "release-blocking").length);
assert.equal(pre.summary.high, pre.findings.filter((finding) => finding.severity === "high").length);
assert.equal(pre.summary.medium, pre.findings.filter((finding) => finding.severity === "medium").length);
assert.equal(pre.summary.total, pre.findings.length);

exactKeys(post, [
  "schema",
  "recordId",
  "phase",
  "captureDate",
  "authority",
  "sourceBinding",
  "method",
  "preFindingDispositions",
  "newFindings",
  "summary",
  "decision",
], "post-correction record");
exactKeys(post.authority, Object.keys(expectedAuthority), "post-correction authority");
assert.equal(post.schema, "chorus.linguistics-red-team.v1");
assert.equal(post.recordId, "linguistics-red-team.post.v1");
assert.equal(post.phase, "post-correction");
assert.match(post.captureDate, /^\d{4}-\d{2}-\d{2}$/u);
assert.deepEqual(post.authority, expectedAuthority, "post-correction authority has drifted");
exactKeys(post.sourceBinding, ["implementationDigest", "verificationPath", "preRecord"], "post-correction source binding");
assertDigest(post.sourceBinding.implementationDigest, "post-correction implementation digest");
assert.equal(post.sourceBinding.verificationPath, "evidence/linguistics/linguistics-verification.v1.json");
exactKeys(post.sourceBinding.preRecord, ["path", "sha256"], "post-correction pre-record binding");
assert.equal(post.sourceBinding.preRecord.path, "evidence/linguistics/linguistics-red-team.pre.v1.json");
assertDigest(post.sourceBinding.preRecord.sha256, "post-correction pre-record digest");
assert.equal(post.sourceBinding.preRecord.sha256, sha256(preBytes), "post-correction record is not bound to the current pre-correction bytes");
assert.ok(post.method && typeof post.method === "object" && !Array.isArray(post.method) && Object.keys(post.method).length > 0, "post-correction method must be a non-empty object");

const dispositionStatuses = ["corrected", "corrected-with-accepted-limitation", "superseded"];
assert.ok(Array.isArray(post.preFindingDispositions), "post-correction dispositions must be an array");
assert.equal(post.preFindingDispositions.length, pre.findings.length, "post-correction dispositions must map one-to-one to pre-correction findings");
const dispositionIds = new Set();
for (const [index, disposition] of post.preFindingDispositions.entries()) {
  const label = `post-correction disposition[${index}]`;
  exactKeys(disposition, ["id", "status", "correction", "evidenceRefs", "residualRisk"], label);
  assert.ok(preIds.has(disposition.id), `${label} cites unknown pre-correction finding ${disposition.id}`);
  assert.ok(!dispositionIds.has(disposition.id), `duplicate post-correction disposition ${disposition.id}`);
  dispositionIds.add(disposition.id);
  assert.ok(dispositionStatuses.includes(disposition.status), `${disposition.id} has invalid disposition status`);
  nonBlank(disposition.correction, `${disposition.id}.correction`);
  assert.ok(Array.isArray(disposition.evidenceRefs) && disposition.evidenceRefs.length > 0, `${disposition.id} lacks evidence references`);
  assert.equal(new Set(disposition.evidenceRefs).size, disposition.evidenceRefs.length, `${disposition.id} repeats an evidence reference`);
  for (const [evidenceIndex, evidenceRef] of disposition.evidenceRefs.entries()) {
    nonBlank(evidenceRef, `${disposition.id}.evidenceRefs[${evidenceIndex}]`);
  }
  nonBlank(disposition.residualRisk, `${disposition.id}.residualRisk`);
}
assert.deepEqual([...dispositionIds].sort(), [...preIds].sort(), "post-correction dispositions omit or invent a pre-correction finding");

const postFindingStatuses = ["corrected", "accepted-limitation", "open"];
assert.ok(Array.isArray(post.newFindings), "post-correction new findings must be an array");
const postFindingIds = new Set();
for (const [index, finding] of post.newFindings.entries()) {
  const label = `post-correction new finding[${index}]`;
  assert.ok(finding && typeof finding === "object" && !Array.isArray(finding), `${label} must be an object`);
  for (const field of ["id", "severity", "status"]) assert.ok(Object.hasOwn(finding, field), `${label} lacks ${field}`);
  assert.match(finding.id, /^LING-POST-\d{3}$/u);
  assert.ok(!preIds.has(finding.id) && !postFindingIds.has(finding.id), `duplicate or colliding post-correction finding ${finding.id}`);
  postFindingIds.add(finding.id);
  assert.ok(findingSeverities.includes(finding.severity), `${finding.id} has invalid severity`);
  assert.ok(postFindingStatuses.includes(finding.status), `${finding.id} has invalid status`);
}
const openBlockers = post.newFindings.filter((finding) => finding.status === "open" && finding.severity === "release-blocking").length;
const openHigh = post.newFindings.filter((finding) => finding.status === "open" && finding.severity === "high").length;
assert.equal(openBlockers, 0, "post-correction record retains an unresolved linguistic release blocker");
assert.equal(openHigh, 0, "post-correction record retains an unresolved high-severity linguistic finding");
exactKeys(post.summary, ["result", "openBlockers", "openHighSeverityFindings"], "post-correction summary");
assert.equal(post.summary.result, "pass-with-release-hold");
assert.equal(post.summary.openBlockers, openBlockers, "post-correction blocker count is inconsistent");
assert.equal(post.summary.openHighSeverityFindings, openHigh, "post-correction high-severity count is inconsistent");
exactKeys(post.decision, ["linguisticImplementation", "release", "openGapIds"], "post-correction decision");
assert.equal(post.decision.linguisticImplementation, "pass");
assert.equal(post.decision.release, "held");
assert.ok(Array.isArray(post.decision.openGapIds), "post-correction decision must enumerate open gap IDs");
assert.equal(new Set(post.decision.openGapIds).size, post.decision.openGapIds.length, "post-correction decision repeats an open gap ID");

exactKeys(verification, [
  "schema",
  "recordId",
  "captureDate",
  "authority",
  "sourceBinding",
  "runs",
  "adversarialSweeps",
  "openGaps",
  "decision",
], "linguistic verification record");
exactKeys(verification.authority, Object.keys(expectedAuthority), "linguistic verification authority");
assert.equal(verification.schema, "chorus.linguistics-verification.v1");
assert.equal(verification.recordId, "linguistics-verification.v1");
assert.match(verification.captureDate, /^\d{4}-\d{2}-\d{2}$/u);
assert.deepEqual(verification.authority, expectedAuthority, "linguistic verification authority has drifted");
exactKeys(verification.sourceBinding, [
  "algorithm",
  "implementationDigest",
  "selectedFiles",
  "statusRecord",
  "statusBinding",
], "linguistic verification source binding");
assert.equal(verification.sourceBinding.algorithm, "sha256-path-length-content");
assertDigest(verification.sourceBinding.implementationDigest, "linguistic verification implementation digest");
assertDigest(verification.sourceBinding.statusBinding, "linguistic verification status binding");
assert.equal(verification.sourceBinding.statusBinding, verification.sourceBinding.implementationDigest, "linguistic verification and status bindings differ");
assert.equal(post.sourceBinding.implementationDigest, verification.sourceBinding.implementationDigest, "post-correction and verification implementation bindings differ");

assert.ok(Array.isArray(verification.sourceBinding.selectedFiles) && verification.sourceBinding.selectedFiles.length > 0, "linguistic verification selected-file manifest is empty");
const selectedPaths = verification.sourceBinding.selectedFiles.map((file) => file.path);
assert.equal(new Set(selectedPaths).size, selectedPaths.length, "linguistic verification selected-file manifest repeats a path");
assert.deepEqual(selectedPaths, [...selectedPaths].sort(), "linguistic verification selected-file manifest must be sorted by path");
const selectedContents = [];
for (const [index, file] of verification.sourceBinding.selectedFiles.entries()) {
  const label = `linguistic verification selectedFiles[${index}]`;
  exactKeys(file, ["path", "bytes", "sha256"], label);
  const resolved = safeRepositoryPath(file.path, `${label}.path`);
  assert.ok(Number.isSafeInteger(file.bytes) && file.bytes >= 0, `${label}.bytes must be a non-negative safe integer`);
  assertDigest(file.sha256, `${label}.sha256`);
  const content = await readFile(resolved);
  assert.equal(file.bytes, content.byteLength, `${file.path} byte count has drifted`);
  assert.equal(file.sha256, sha256(content), `${file.path} SHA-256 has drifted`);
  selectedContents.push({ path: file.path, content });
}
assert.equal(bindingDigest(selectedContents), verification.sourceBinding.implementationDigest, "linguistic verification implementation digest does not match the selected files under the status binding algorithm");

const statusRecordPath = safeRepositoryPath(verification.sourceBinding.statusRecord, "linguistic verification status record");
assert.equal(verification.sourceBinding.statusRecord, "evidence/runs/updated-working-tree-status.v1.json");
const statusRecord = JSON.parse(await readFile(statusRecordPath, "utf8"));
const statusImplementation = statusRecord.implementation_binding;
assert.ok(statusImplementation && typeof statusImplementation === "object" && !Array.isArray(statusImplementation), "status record lacks implementation_binding");
assert.equal(statusImplementation.algorithm, verification.sourceBinding.algorithm, "status record uses a different implementation-binding algorithm");
assert.equal(statusImplementation.digest, verification.sourceBinding.statusBinding, "linguistic verification status binding does not match the status record");
assert.equal(statusImplementation.file_count, verification.sourceBinding.selectedFiles.length, "status record and linguistic verification bind different file counts");
assert.deepEqual(statusImplementation.files, verification.sourceBinding.selectedFiles, "status record and linguistic verification selected-file manifests differ");

assert.ok(Array.isArray(verification.runs) && verification.runs.length > 0, "linguistic verification must retain at least one run");
const runIds = new Set();
for (const [index, run] of verification.runs.entries()) {
  const label = `linguistic verification run[${index}]`;
  assert.ok(run && typeof run === "object" && !Array.isArray(run), `${label} must be an object`);
  for (const field of ["id", "command", "result", "exitCode"]) assert.ok(Object.hasOwn(run, field), `${label} lacks ${field}`);
  nonBlank(run.id, `${label}.id`);
  assert.ok(!runIds.has(run.id), `duplicate linguistic verification run ${run.id}`);
  runIds.add(run.id);
  nonBlank(run.command, `${label}.command`);
  assert.equal(run.result, "pass", `${run.id} is not a passing retained run`);
  assert.equal(run.exitCode, 0, `${run.id} has a nonzero exit code`);
}
assert.ok(Array.isArray(verification.adversarialSweeps) && verification.adversarialSweeps.length > 0, "linguistic verification lacks adversarial sweeps");
for (const [index, sweep] of verification.adversarialSweeps.entries()) {
  const label = `linguistic verification adversarialSweeps[${index}]`;
  assert.ok(sweep && typeof sweep === "object" && !Array.isArray(sweep), `${label} must be an object`);
  if (Object.hasOwn(sweep, "result")) assert.equal(sweep.result, "pass", `${label} is not passed`);
  if (Object.hasOwn(sweep, "status")) assert.equal(sweep.status, "pass", `${label} is not passed`);
}

assert.ok(Array.isArray(verification.openGaps) && verification.openGaps.length >= 4, "linguistic verification must retain the manual, browser, dependency, and current-route promotion gaps");
const gapIds = new Set();
for (const [index, gap] of verification.openGaps.entries()) {
  const label = `linguistic verification openGaps[${index}]`;
  exactKeys(gap, ["id", "status", "evidence"], label);
  nonBlank(gap.id, `${label}.id`);
  assert.ok(!gapIds.has(gap.id), `duplicate linguistic verification gap ${gap.id}`);
  gapIds.add(gap.id);
  assert.equal(gap.status, "open", `${gap.id} must remain explicitly open`);
  nonBlank(gap.evidence, `${gap.id}.evidence`);
}
const gapText = verification.openGaps.map((gap) => `${gap.id} ${gap.evidence}`);
for (const [category, pattern] of Object.entries({
  manual: /manual|assistive|screen[ -]?reader|voiceover|nvda|viewport|accessibility/iu,
  browser: /browser/iu,
  dependency: /dependenc|advisory|lockfile/iu,
  "current route": /current(?:-source)?[ -]+route|production[ -]+route|route[ -]+check/iu,
})) {
  assert.ok(gapText.some((value) => pattern.test(value)), `linguistic verification lacks an explicit ${category} promotion gap`);
}

exactKeys(verification.decision, [
  "automatedWorkingTree",
  "linguisticBlockers",
  "linguisticHighSeverityOpen",
  "releaseHold",
  "releaseState",
  "reason",
], "linguistic verification decision");
assert.equal(verification.decision.automatedWorkingTree, "pass");
assert.equal(verification.decision.linguisticBlockers, 0);
assert.equal(verification.decision.linguisticHighSeverityOpen, 0);
assert.equal(verification.decision.releaseHold, true);
assert.equal(verification.decision.releaseState, "held");
nonBlank(verification.decision.reason, "linguistic verification release-hold reason");
assert.deepEqual([...post.decision.openGapIds].sort(), [...gapIds].sort(), "post-correction decision and verification open gaps differ");

console.log(`linguistic evidence chain valid: ${inventory.atoms.length} atoms, ${pre.findings.length} pre findings, ${post.preFindingDispositions.length} dispositions, ${post.newFindings.length} post findings, ${verification.runs.length} runs, ${verification.openGaps.length} held release gaps`);
