import React, { useEffect, useState } from "react";
import { saveData, getData } from "./helpers/storage";

interface TextRow {
  id: string;
  label: string;
  content: string;
}

export const StorageText: React.FC = () => {
  const [rows, setRows] = useState<TextRow[]>([]);
  const [savedRows, setSavedRows] = useState<TextRow[]>([]);

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      const loadedRows = (await getData("textRows")) || [];
      setRows(loadedRows);
      setSavedRows(loadedRows); // Keep a local cache of saved state
    };
    loadSavedData();
  }, []);

  const addNewRow = () => {
    const newRow: TextRow = {
      id: Date.now().toString(),
      label: "",
      content: "",
    };
    setRows([...rows, newRow]);
  };

  const updateRow = (id: string, field: "label" | "content", value: string) => {
    // const input = document.activeElement as HTMLInputElement;
    // const cursorPosition = input?.selectionStart || 0;
    // const updatedRows = rows.map((row) => {
    //   const valueToAdd =
    //     field === "content"
    //       ? handleFormatting(value, cursorPosition, input)
    //       : value;
    //   return row.id === id ? { ...row, [field]: valueToAdd } : row;
    // });
    // setRows(updatedRows);
  };

  const deleteRow = async (id: string) => {
    const filteredRows = rows.filter((row) => row.id !== id);
    setRows(filteredRows);
    await saveData("textRows", filteredRows);
    setSavedRows(filteredRows);
  };

  const saveRow = async () => {
    await saveData("textRows", rows);
    setSavedRows(rows);
  };

  const isRowChanged = (row: TextRow) => {
    const savedRow = savedRows.find((r) => r.id === row.id);
    return (
      !savedRow ||
      savedRow.label !== row.label ||
      savedRow.content !== row.content
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={addNewRow}>+</button>

      {rows.map((row) => (
        <div
          key={row.id}
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "10px",
            alignItems: "center",
          }}
        >
          <button onClick={() => deleteRow(row.id)}>X</button>

          <input
            placeholder="Label"
            value={row.label}
            onChange={(e) => updateRow(row.id, "label", e.target.value)}
            style={{ width: "100px" }}
          />

          <input
            value={row.content}
            onChange={(e) => updateRow(row.id, "content", e.target.value)}
            style={{ width: "300px" }}
          />

          {row.label && row.content && isRowChanged(row) && (
            <button onClick={saveRow}>Save</button>
          )}
        </div>
      ))}
    </div>
  );
};
