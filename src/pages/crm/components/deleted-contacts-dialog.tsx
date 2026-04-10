import { useState } from "react";
import {
  useCrmDeletedContacts,
  useCrmContactRestore,
  useCrmContactPermanentDelete,
} from "@/api/crm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RotateCcw, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletedContactsDialog({ open, onOpenChange }: Props) {
  const { data, isLoading } = useCrmDeletedContacts();
  const restoreMut = useCrmContactRestore();
  const permanentDeleteMut = useCrmContactPermanentDelete();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const contacts = data?.contacts ?? [];

  function handleRestore(id: number) {
    restoreMut.mutate(
      { id },
      {
        onSuccess: () => toast.success("Contact restored"),
        onError: () => toast.error("Failed to restore contact"),
      },
    );
  }

  function handlePermanentDelete() {
    if (confirmDeleteId === null) return;
    permanentDeleteMut.mutate(confirmDeleteId, {
      onSuccess: () => {
        toast.success("Contact permanently deleted");
        setConfirmDeleteId(null);
      },
      onError: () => toast.error("Failed to delete contact"),
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deleted Contacts</DialogTitle>
            <DialogDescription>
              Restore or permanently delete contacts from trash.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="py-12 text-center text-[var(--muted-foreground)]">
              No deleted contacts
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Deleted On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.first_name || c.last_name
                        ? `${c.first_name} ${c.last_name}`.trim()
                        : c.name}
                    </TableCell>
                    <TableCell className="text-sm">{c.email}</TableCell>
                    <TableCell className="text-sm">{c.phone}</TableCell>
                    <TableCell className="text-sm text-[var(--muted-foreground)]">
                      {new Date(c.deleted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRestore(c.id)}
                          disabled={restoreMut.isPending}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => setConfirmDeleteId(c.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Permanent delete confirmation */}
      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(v) => !v && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Forever</AlertDialogTitle>
            <AlertDialogDescription>
              This contact will be permanently deleted. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
