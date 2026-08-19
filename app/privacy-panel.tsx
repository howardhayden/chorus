"use client";

import { useRef, useState, type ChangeEvent } from "react";
import type { NightState } from "./night-engine";
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
  const [status, setStatus] = useState("Session only. Nothing has been written by this panel.");
  const fileRef = useRef<HTMLInputElement>(null);

  function storage(): Storage {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new SaveModelError("STORAGE_UNAVAILABLE", "Local browser storage is unavailable.");
    }
    return window.localStorage;
  }

  function report(error: unknown) {
    const message = error instanceof SaveModelError ? error.message : "That save action could not be completed.";
    setStatus(message);
    onAnnounce(message);
  }

  function refreshSlots() {
    try {
      const next = inspectLocalSlots(storage());
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
      setStatus(`Current night saved to local slot ${slot}.`);
      onAnnounce(`Current night saved to local slot ${slot}.`);
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
    setConfirmClear(slot);
    setStatus(`Clear local slot ${slot}? This cannot be undone.`);
  }

  function clearSlot(slot: SaveSlot) {
    const consent = consents[slot] ?? grantLocalSlotConsent(slot);
    try {
      clearLocalSlot(storage(), consent);
      setSlots(inspectLocalSlots(storage()));
      setConfirmClear(null);
      setStatus(`Local slot ${slot} cleared.`);
      onAnnounce(`Local slot ${slot} cleared.`);
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
      setStatus("Portable text created. Your browser controls where it is kept.");
      onAnnounce("Portable CHORUS save downloaded.");
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
      setStatus("Save checked. Review the summary before loading it.");
      onAnnounce("Portable save checked and ready for review.");
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

  return <div className="privacy-panel">
    <section className="privacy-current" aria-labelledby="privacy-current-title">
      <span className="panel-label">CURRENT MODE</span>
      <h3 id="privacy-current-title">Session only</h3>
      <p>Play stays in this tab unless you deliberately choose a local slot or portable text.</p>
    </section>

    <details className="privacy-disclosure">
      <summary><span>Browser slots</span><small>Optional · this device</small></summary>
      <div className="privacy-disclosure-body">
        <p>Checking reads only CHORUS slots. Writing or clearing requires a fresh choice for that slot in this panel.</p>
        {slots === null ? <button type="button" onClick={refreshSlots}>Check local slots</button> : <div className="save-slot-list">
          {SAVE_SLOTS.map((slot) => {
            const inspection = slots.find((item) => item.slot === slot) ?? { slot, status: "empty" as const };
            const consent = consents[slot];
            return <article className="save-slot" key={slot}>
              <header><strong>Slot {slot}</strong><span>{slotStatus(inspection)}</span></header>
              {inspection.status === "ready" && <SavePreviewLine preview={inspection.preview} />}
              {inspection.status === "invalid" && <p>This slot cannot be validated.</p>}
              <div className="save-slot-actions">
                {!consent ? <button type="button" onClick={() => enableSlot(slot)}>Enable slot {slot}</button> : <button type="button" onClick={() => saveSlot(slot)}>Save current night</button>}
                {inspection.status === "ready" && <button type="button" onClick={() => restoreSlot(slot)}>Load</button>}
                {inspection.status !== "empty" && (confirmClear === slot ? <><button className="danger-action" type="button" onClick={() => clearSlot(slot)}>Confirm clear</button><button type="button" onClick={() => setConfirmClear(null)}>Keep</button></> : <button type="button" onClick={() => requestClear(slot)}>Clear</button>)}
              </div>
            </article>;
          })}
        </div>}
      </div>
    </details>

    <details className="privacy-disclosure">
      <summary><span>Portable text</span><small>Optional · player-controlled</small></summary>
      <div className="privacy-disclosure-body portable-save-grid">
        <section><h3>Output</h3><p>Download the current ledger as a validated text file.</p><button type="button" onClick={exportText}>Download save text</button></section>
        <section><h3>Input</h3><p>Selecting a file checks it first. Nothing changes until you confirm the preview.</p><label className="file-picker">Choose save text<input ref={fileRef} type="file" accept=".txt,text/plain,application/json" onChange={inspectImport} /></label></section>
        {pendingImport && <aside className="import-preview" aria-labelledby="import-preview-title"><span className="panel-label">CHECKED · NOT LOADED</span><h3 id="import-preview-title">{pendingImportName}</h3><SavePreviewLine preview={pendingImport.preview} /><div><button type="button" onClick={restoreImport}>Load this night</button><button type="button" onClick={() => { setPendingImport(null); setPendingImportName(""); if (fileRef.current) fileRef.current.value = ""; }}>Cancel</button></div></aside>}
      </div>
    </details>

    <details className="privacy-disclosure">
      <summary><span>Technical record</span><small>Complete system · spoilers</small></summary>
      <div className="privacy-disclosure-body">
        <p>Executed architecture and verification notebooks, with downloadable source.</p>
        <a className="privacy-reference-link" href="/notebooks/index.html" target="_blank" rel="noreferrer">Open notebook index · new tab</a>
      </div>
    </details>

    <p className="privacy-status" role="status">{status}</p>
  </div>;
}

function SavePreviewLine({ preview }: { preview: SavePreview }) {
  return <p className="save-preview">Turn {preview.turn}/24 · {preview.enteredRooms}/6 entered · {preview.completedRooms}/6 closed · saved {formatSaveDate(preview.exportedAt)}</p>;
}

function slotStatus(inspection: LocalSlotInspection) {
  if (inspection.status === "empty") return "EMPTY";
  if (inspection.status === "invalid") return "NEEDS REVIEW";
  return `TURN ${inspection.preview.turn}`;
}

function formatSaveDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return "date unavailable";
  }
}
