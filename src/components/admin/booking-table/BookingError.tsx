
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BookingErrorProps {
  error: string;
}

const BookingError = ({ error }: BookingErrorProps) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="p-2 bg-red-50">
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao criar ordem</AlertTitle>
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      </TableCell>
    </TableRow>
  );
};

export default BookingError;
