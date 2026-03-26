import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TriangleAlert } from 'lucide-react';

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  itemLabel?: string;
}

const DeleteConfirmDialog = ({ open, onConfirm, onCancel, itemLabel = 'this item' }: Props) => (
  <AlertDialog open={open} onOpenChange={o => !o && onCancel()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2 font-display">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/15 shrink-0">
            <TriangleAlert className="w-4 h-4 text-destructive" />
          </span>
          Delete {itemLabel}?
        </AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete <span className="font-medium text-foreground">{itemLabel}</span>?
          This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeleteConfirmDialog;
