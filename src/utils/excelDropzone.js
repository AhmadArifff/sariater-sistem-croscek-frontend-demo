export function createExcelDropEvent(file) {
  return {
    target: {
      files: [file],
      value: "",
    },
  };
}

export function getExcelDropzoneHandlers(onFileChange, setDragging) {
  const stopDefault = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    onDragEnter: (event) => {
      stopDefault(event);
      setDragging(true);
    },
    onDragOver: (event) => {
      stopDefault(event);
      setDragging(true);
    },
    onDragLeave: (event) => {
      stopDefault(event);
      if (event.currentTarget.contains(event.relatedTarget)) return;
      setDragging(false);
    },
    onDrop: (event) => {
      stopDefault(event);
      setDragging(false);

      const file = event.dataTransfer?.files?.[0];
      if (!file) return;

      onFileChange(createExcelDropEvent(file));
    },
  };
}

export function excelDropzoneClassName(isDragging) {
  return isDragging ? " ring-4 ring-[#1BA39C]/30 bg-[#e9f7f7]" : "";
}
