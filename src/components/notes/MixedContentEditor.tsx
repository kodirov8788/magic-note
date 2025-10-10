"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Table, Type } from "lucide-react";
import TableCopyButton from "./TableCopyButton";
import { ContentItem } from "@/types";

interface MixedContentEditorProps {
  contentItems: ContentItem[];
  onChange: (contentItems: ContentItem[]) => void;
}

export default function MixedContentEditor({
  contentItems,
  onChange,
}: MixedContentEditorProps) {
  const [items, setItems] = useState<ContentItem[]>(contentItems);

  // Update items when contentItems prop changes
  useEffect(() => {
    setItems(contentItems);
  }, [contentItems]);

  // Update items and notify parent
  const updateItems = (newItems: ContentItem[]) => {
    setItems(newItems);
    onChange(newItems);
  };

  const deleteItem = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    updateItems(newItems);
  };

  const updateTableRow = (
    id: string,
    field: "key" | "value",
    value: string
  ) => {
    const newItems = items.map((item) =>
      item.id === id && item.type === "table-row"
        ? { ...item, [field]: value }
        : item
    );
    updateItems(newItems);
  };

  const updateTextField = (id: string, text: string) => {
    const newItems = items.map((item) =>
      item.id === id && item.type === "text-field" ? { ...item, text } : item
    );
    updateItems(newItems);
  };

  const copyRow = (item: ContentItem) => {
    if (item.type === "table-row") {
      return `${item.key}: ${item.value}`;
    } else {
      return item.text;
    }
  };

  const addTableRow = () => {
    const newItem: ContentItem = {
      type: "table-row",
      id: `table-${Date.now()}`,
      key: "",
      value: "",
    };
    updateItems([...items, newItem]);
  };

  const addTextField = () => {
    const newItem: ContentItem = {
      type: "text-field",
      id: `text-${Date.now()}`,
      text: "",
    };
    updateItems([...items, newItem]);
  };

  return (
    <div className="h-full p-4 lg:p-6 overflow-y-auto overflow-x-hidden">
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>
              No content yet. Use the buttons above to add table rows or text
              fields.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              className={`rounded-xl p-4 mb-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
                item.type === "table-row"
                  ? "bg-primary/5 border-l-4 border-primary"
                  : "bg-muted/50 border-l-4 border-muted"
              }`}
            >
              <CardContent className="p-0">
                {item.type === "table-row" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 lg:gap-4 items-center">
                    <div className="sm:col-span-5">
                      <div className="relative group">
                        <Input
                          value={item.key}
                          onChange={(e) =>
                            updateTableRow(item.id, "key", e.target.value)
                          }
                          placeholder="Enter key..."
                          className="pr-8"
                        />
                        {item.key.trim() && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <TableCopyButton
                              content={item.key}
                              label="Key"
                              variant="cell"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-5">
                      <div className="relative group">
                        <Input
                          value={item.value}
                          onChange={(e) =>
                            updateTableRow(item.id, "value", e.target.value)
                          }
                          placeholder="Enter value..."
                          className="pr-8"
                        />
                        {item.value.trim() && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <TableCopyButton
                              content={item.value}
                              label="Value"
                              variant="cell"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex items-center justify-end sm:justify-center space-x-2 mt-2 sm:mt-0">
                      {(item.key.trim() || item.value.trim()) && (
                        <TableCopyButton
                          content={copyRow(item)}
                          variant="row"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative group">
                      <Textarea
                        value={item.text}
                        onChange={(e) =>
                          updateTextField(item.id, e.target.value)
                        }
                        placeholder="Enter text content..."
                        className="pr-8 min-h-[100px] resize-none"
                      />
                      {item.text.trim() && (
                        <div className="absolute right-2 top-2">
                          <TableCopyButton
                            content={item.text}
                            label="Text"
                            variant="cell"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}

        {/* Add Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="md"
            onClick={addTableRow}
            className="flex-1"
          >
            <Table className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Table Row</span>
            <span className="sm:hidden">Table Row</span>
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={addTextField}
            className="flex-1"
          >
            <Type className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Text Field</span>
            <span className="sm:hidden">Text Field</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
