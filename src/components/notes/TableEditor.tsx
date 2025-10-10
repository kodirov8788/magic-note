"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import TableCopyButton from "./TableCopyButton";

interface TableEditorProps {
  content: string;
  onChange: (content: string) => void;
}

interface TableRow {
  id: string;
  key: string;
  value: string;
}

export default function TableEditor({ content, onChange }: TableEditorProps) {
  const [rows, setRows] = useState<TableRow[]>([]);

  // Parse content into table rows
  useEffect(() => {
    const lines = content.split("\n").filter((line) => line.trim());
    const parsedRows: TableRow[] = lines.map((line, index) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        return {
          id: `row-${index}`,
          key: line.substring(0, colonIndex).trim(),
          value: line.substring(colonIndex + 1).trim(),
        };
      }
      return {
        id: `row-${index}`,
        key: line.trim(),
        value: "",
      };
    });

    // Ensure at least one empty row
    if (parsedRows.length === 0) {
      parsedRows.push({ id: "row-0", key: "", value: "" });
    }

    setRows(parsedRows);
  }, [content]);

  // Update content when rows change
  const updateContent = (newRows: TableRow[]) => {
    const contentString = newRows
      .filter((row) => row.key.trim() || row.value.trim())
      .map((row) => `${row.key}: ${row.value}`)
      .join("\n");
    onChange(contentString);
  };

  const addRow = () => {
    const newRow: TableRow = {
      id: `row-${Date.now()}`,
      key: "",
      value: "",
    };
    const newRows = [...rows, newRow];
    setRows(newRows);
    updateContent(newRows);
  };

  const deleteRow = (id: string) => {
    const newRows = rows.filter((row) => row.id !== id);
    setRows(newRows);
    updateContent(newRows);
  };

  const updateRow = (id: string, field: "key" | "value", value: string) => {
    const newRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    setRows(newRows);
    updateContent(newRows);
  };

  const copyRow = (row: TableRow) => {
    return `${row.key}: ${row.value}`;
  };

  return (
    <div className="h-full p-6">
      <Card className="h-full">
        <CardContent className="p-6 h-full overflow-y-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-gray-600 border-b pb-2">
              <div className="col-span-4">Key</div>
              <div className="col-span-4">Value</div>
              <div className="col-span-4">Actions</div>
            </div>

            {/* Rows */}
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-12 gap-4 items-center"
              >
                <div className="col-span-4">
                  <div className="relative group">
                    <Input
                      value={row.key}
                      onChange={(e) => updateRow(row.id, "key", e.target.value)}
                      placeholder="Enter key..."
                      className="pr-8"
                    />
                    {row.key.trim() && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <TableCopyButton
                          content={row.key}
                          label="Key"
                          variant="cell"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="relative group">
                    <Input
                      value={row.value}
                      onChange={(e) =>
                        updateRow(row.id, "value", e.target.value)
                      }
                      placeholder="Enter value..."
                      className="pr-8"
                    />
                    {row.value.trim() && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <TableCopyButton
                          content={row.value}
                          label="Value"
                          variant="cell"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-4 flex items-center space-x-2">
                  {(row.key.trim() || row.value.trim()) && (
                    <TableCopyButton content={copyRow(row)} variant="row" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRow(row.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Row Button */}
            <div className="pt-4">
              <Button variant="outline" onClick={addRow} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
