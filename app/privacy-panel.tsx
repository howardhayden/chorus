"use client";

import { useLayoutEffect, useRef, useState, type ChangeEvent } from "react";
import { isNightComplete, type NightState } from "./night-engine";
import {
  MAX_PORTABLE_SAVE_BYTES,
  SAVE_SLOTS,
  SaveModelError,
  clearLocalSlot,
  createPortableSave,
  grantLocalSlotConsent,
  inspectLocalSlots,
  loadLocalSlot,
  parsePortableSave,
  saveLocalSlot,
  type LocalSlotConsent,
  type LocalSlotInspection,
  type ParsedPortableSave,
  type SavePreview,
  type SaveSlot,
} from "./save-model";

type PrivacyPanelProps = {
  state: NightState;
  onRestore: (state: NightState) => void;
  onAnnounce: (message: string) => void;
};

export function PrivacyPanel({ state, onRestore, onAnnounce }: PrivacyPanelProps) {
  const [slots, setSlots] = useState<LocalSlotInspection[] | null>(null);
  const [consents, setConsents] = useState<Partial<Record<SaveSlot, LocalSlotConsent>>>({});
  const [pendingImport, setPendingImport] = useState<ParsedPortableSave | null>(null);
  const [pendingImportName, setPendingImportName] = useState("");
  const [confirmClear, setConfirmClear] = useState<SaveSlot | null>(null);
  const [status, setStatus] = useState("This night is in this open tab. This panel has not saved it.");
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingFocusRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!pendingFocusRef.current) return;
    const target = document.getElementById(pendingFocusRef.current);
    if (!target) return;
    target.focus({ preventScroll: true });
    pendingFocusRef.current = null;
  });

  function focusAfterUpdate(id: string) {
    pendingFocusRef.current = id;
  }

  function storage(): Storage {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new SaveModelError("STORAGE_UNAVAILABLE", "This site cannot use storage in this browser profile.");
    }
    return window.localStorage;
  }

  function report(error: unknown) {
    const message = error instanceof SaveModelError ? error.message : "That save action could not be completed.";
    setStatus(message);
  }

  function refreshSlots() {
    try {
      const next = inspectLocalSlots(storage());
      focusAfterUpdate("slot-A-primary");
      setSlots(next);
      setStatus("Local slots checked. No save was loaded or changed.");
    } catch (error) {
      report(error);
    }
  }

  function enableSlot(slot: SaveSlot) {
    setConsents((current) => ({ ...current, [slot]: grantLocalSlotConsent(slot) }));
    setStatus(`Slot ${slot} is enabled for this open panel. Nothing has been written yet.`);
  }

  function saveSlot(slot: SaveSlot) {
    const consent = consents[slot];
    if (!consent) return;
    try {
      saveLocalSlot(storage(), consent, state);
      setSlots(inspectLocalSlots(storage()));
      setStatus(`Current night saved to slot ${slot} in this browser profile.`);
    } catch (error) {
      report(error);
    }
  }

  function restoreSlot(slot: SaveSlot) {
    try {
      const parsed = loadLocalSlot(storage(), slot);
      onRestore(parsed.state);
      onAnnounce(`Local slot ${slot} loaded. Turn ${parsed.preview.turn} restored.`);
    } catch (error) {
      report(error);
    }
  }

  function requestClear(slot: SaveSlot) {
    if (!consents[slot]) {
      setConsents((current) => ({ ...current, [slot]: grantLocalSlotConsent(slot) }));
    }
    focusAfterUpdate(`slot-${slot}-confirm-clear`);
    setConfirmClear(slot);
    setStatus(`Clear local slot ${slot}? This cannot be undone.`);
  }

  function clearSlot(slot: SaveSlot) {
    const consent = consents[slot] ?? grantLocalSlotConsent(slot);
    try {
      clearLocalSlot(storage(), consent);
      focusAfterUpdate(`slot-${slot}-primary`);
      setSlots(inspectLocalSlots(storage()));
      setConfirmClear(null);
      setStatus(`Local slot ${slot} cleared.`);
    } catch (error) {
      report(error);
    }
  }

  function exportText() {
    try {
      const text = createPortableSave(state);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chorus-night-turn-${state.turn}.txt`;
      link.hidden = true;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setStatus("Save text created and handed to your browser. Your browser controls whether and where it is saved.");
    } catch (error) {
      report(error);
    }
  }

  async function inspectImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPendingImport(null);
    setPendingImportName("");
    if (!file) return;
    if (file.size > MAX_PORTABLE_SAVE_BYTES) {
      report(new SaveModelError("SAVE_TOO_LARGE", "That save is larger than CHORUS accepts."));
      event.target.value = "";
      return;
    }
    try {
      const parsed = parsePortableSave(await file.text());
      setPendingImport(parsed);
      setPendingImportName(file.name);
      setStatus("Integrity and replay checks passed. These checks do not authenticate the file. Review the summary before loading it.");
    } catch (error) {
      report(error);
      event.target.value = "";
    }
  }

  function restoreImport() {
    if (!pendingImport) return;
    const turn = pendingImport.preview.turn;
    onRestore(pendingImport.state);
    setPendingImport(null);
    setPendingImportName("");
    if (fileRef.current) fileRef.current.value = "";
    onAnnounce(`Portable save loaded. Turn ${turn} restored.`);
  }

  function keepSlot(slot: SaveSlot) {
    focusAfterUpdate(`slot-${slot}-clear`);
    setConfirmClear(null);
    setStatus(`Local slot ${slot} kept.`);
  }

  function cancelImport() {
    focusAfterUpdate("portable-save-file");
    setPendingImport(null);
    setPendingImportName("");
    setStatus("Selected file cleared. The current night was not changed.");
    if (fileRef.current) fileRef.current.value = "";
  }

  return <div className="privacy-panel">
    <section className="privacy-current" aria-labelledby="privacy-current-title">
      <span className="panel-label">CURRENT MODE</span>
      <h3 id="privacy-current-title">Only this open tab</h3>
      <p>Your current night is in this tab&apos;s memory. Closing or reloading the tab can erase it. Nothing is saved unless you choose a browser slot or create save text.</p>
    </section>

    <details className="privacy-disclosure">
      <summary><span>Browser slots</span><small>Optional · this browser profile</small></summary>
      <div className="privacy-disclosure-body">
        <p>Slots use this site&apos;s storage in this browser profile. Another CHORUS tab in the same profile can read them. Each current slot stores a compact numeric replay trace, not generated scene, choice, effect, or conclusion prose. The matching CHORUS code can reconstruct the night from that trace, so this is data minimization rather than encryption. CHORUS does not copy slots to another browser or device; your browser controls any backup, sync, or deletion of site data. Checking reads only CHORUS slots. A slot is written or cleared only after you choose it in this open panel.</p>
        {slots === null ? <button type="button" onClick={refreshSlots}>Check local slots</button> : <div className="save-slot-list">
          {SAVE_SLOTS.map((slot) => {
            const inspection = slots.find((item) => item.slot === slot) ?? { slot, status: "empty" as const };
            const consent = consents[slot];
            return <article className="save-slot" key={slot}>
              <header><strong>Slot {slot}</strong><span>{slotStatus(inspection)}</span></header>
              {inspection.status === "ready" && <SavePreviewLine preview={inspection.preview} />}
              {inspection.status === "invalid" && <p>{slotProblem(inspection)}</p>}
              <div className="save-slot-actions">
                {!consent ? <button id={`slot-${slot}-primary`} type="button" onClick={() => enableSlot(slot)}>Enable slot {slot}</button> : <button id={`slot-${slot}-primary`} type="button" aria-label={`Save current night to slot ${slot}`} onClick={() => saveSlot(slot)}>Save current night</button>}
                {inspection.status === "ready" && <button type="button" aria-label={`Load slot ${slot}`} onClick={() => restoreSlot(slot)}>Load</button>}
                {inspection.status !== "empty" && !(inspection.status === "invalid" && inspection.errorCode === "STORAGE_UNAVAILABLE") && (confirmClear === slot ? <><button id={`slot-${slot}-confirm-clear`} className="danger-action" type="button" aria-label={`Confirm clear slot ${slot}`} onClick={() => clearSlot(slot)}>Confirm clear</button><button type="button" aria-label={`Keep slot ${slot}`} onClick={() => keepSlot(slot)}>Keep</button></> : <button id={`slot-${slot}-clear`} type="button" aria-label={`Clear slot ${slot}`} onClick={() => requestClear(slot)}>Clear</button>)}
              </div>
            </article>;
          })}
        </div>}
      </div>
    </details>

    <details className="privacy-disclosure">
      <summary><span>Portable text</span><small>Optional · a file you control</small></summary>
      <div className="privacy-disclosure-body portable-save-grid">
        <section><h3>Create</h3><p>Ask your browser to create a compact text trace containing the seed, modeled time, entered room numbers, and choice coordinates. CHORUS reconstructs and checks the current night before creating it; generated prose and derived analysis are not copied into the trace. Your browser decides whether and where the file is saved.</p><button type="button" onClick={exportText}>Download save text</button></section>
        <section><h3>Open</h3><p>CHORUS checks the file&apos;s format and integrity digest, then asks the stated generator to replay its numeric trace. These checks can find corruption, impossible choices, or inconsistent timing. They do not prove who made the file or whether its account is true. Nothing changes until you confirm the preview.</p><label className="file-picker">Choose save text<input id="portable-save-file" ref={fileRef} type="file" accept=".txt,text/plain,application/json" onChange={inspectImport} /></label></section>
        {pendingImport && <aside className="import-preview" aria-labelledby="import-preview-title"><span className="panel-label">CHECKED · NOT LOADED</span><h3 id="import-preview-title">{pendingImportName}</h3><SavePreviewLine preview={pendingImport.preview} /><div><button type="button" onClick={restoreImport}>Load this night</button><button type="button" onClick={cancelImport}>Cancel</button></div></aside>}
      </div>
    </details>

    {isNightComplete(state) && <details className="privacy-disclosure">
      <summary><span>Technical record</span><small>Supporting records · spoilers</small></summary>
      <div className="privacy-disclosure-body">
        <p>Architecture and verification notebooks show how parts of CHORUS were designed and checked. They support the record; they are not a complete account of the running system. Their source files are available from the index.</p>
        <a className="privacy-reference-link" href="/notebooks/index.html" target="_blank" rel="noreferrer">Open notebook index · new tab</a>
      </div>
    </details>}

    <p className="privacy-status" role="status">{status}</p>
  </div>;
}

function SavePreviewLine({ preview }: { preview: SavePreview }) {
  return <p className="save-preview">Turn {preview.turn}/24 · {preview.enteredRooms}/6 entered · {preview.completedRooms}/6 closed · saved {formatSaveDate(preview.exportedAt)}</p>;
}

function slotStatus(inspection: LocalSlotInspection) {
  if (inspection.status === "empty") return "EMPTY";
  if (inspection.status === "invalid") return inspection.errorCode === "STORAGE_UNAVAILABLE" ? "UNREADABLE" : "NEEDS REVIEW";
  return `TURN ${inspection.preview.turn}`;
}

function slotProblem(inspection: Extract<LocalSlotInspection, { status: "invalid" }>): string {
  return inspection.errorCode === "STORAGE_UNAVAILABLE"
    ? "This browser could not read this slot. Its contents were not checked or changed."
    : "The saved text in this slot did not pass CHORUS's format, integrity, or replay checks.";
}

function formatSaveDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return "date unavailable";
  }
}
