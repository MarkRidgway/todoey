"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createList, listExists } from "@/actions/list-actions";
import { isValidListKey } from "@/lib/validation";
import {
  addSavedList,
  getServerSnapshot,
  getSnapshot,
  removeSavedList,
  renameSavedList,
  subscribe,
} from "@/lib/saved-lists";

export function ListSelector() {
  const router = useRouter();
  const savedLists = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [draftLabels, setDraftLabels] = useState<Record<string, string>>({});
  const [pastedKey, setPastedKey] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const { listKey } = await createList();
      addSavedList(listKey, "New list");
      router.push(`/${listKey}`);
    });
  }

  function commitLabel(listKey: string, label: string) {
    renameSavedList(listKey, label);
    setDraftLabels((prev) => {
      const next = { ...prev };
      delete next[listKey];
      return next;
    });
  }

  function handleLoad() {
    const key = pastedKey.trim();
    if (!isValidListKey(key)) {
      setPasteError("That doesn't look like a valid list key");
      return;
    }
    setPasteError(null);
    startTransition(async () => {
      const exists = await listExists(key);
      if (!exists) {
        setPasteError("No list found with that key");
        return;
      }
      addSavedList(key, "Loaded list");
      router.push(`/${key}`);
    });
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Todoey</h1>
        <p className="text-sm text-muted-foreground">
          Select a list, create a new one, or load one with a list key.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {savedLists.length === 0 && (
          <p className="text-sm text-muted-foreground">No lists saved on this device yet.</p>
        )}
        {savedLists.map((list) => (
          <Card key={list.listKey}>
            <CardContent className="flex items-center gap-3">
              <div className="flex flex-1 flex-col gap-1">
                <Input
                  value={draftLabels[list.listKey] ?? list.label}
                  onChange={(e) =>
                    setDraftLabels((prev) => ({ ...prev, [list.listKey]: e.target.value }))
                  }
                  onBlur={(e) => commitLabel(list.listKey, e.target.value)}
                />
                <span className="truncate font-mono text-xs text-muted-foreground">{list.listKey}</span>
              </div>
              <Button variant="outline" size="icon" onClick={() => router.push(`/${list.listKey}`)}>
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSavedList(list.listKey)}
                aria-label="Remove from this device"
              >
                <X className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleCreate} disabled={isPending}>
        <Plus className="size-4" /> Create new list
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Load a list</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="list-key">List key</Label>
          <Input
            id="list-key"
            placeholder="Paste a list key"
            value={pastedKey}
            onChange={(e) => {
              setPastedKey(e.target.value);
              setPasteError(null);
            }}
            aria-invalid={!!pasteError}
          />
          {pasteError && <p className="text-sm text-destructive">{pasteError}</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleLoad} disabled={isPending || !pastedKey.trim()}>
            Load list
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
