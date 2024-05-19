import { useEffect } from "react";

function SaveButton ({saved}) {
  useEffect (() => {
    const handleKey = (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        const button = document.getElementById("save");
        if (button) button.click();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });

  return (
    <div className="text-center">
      <button
        className={"btn " + (saved ? "  btn-success" : " btn-primary")}
        type="submit"
        id="save">
          保存并继续
      </button>
      <div className="form-text">可按Ctrl+Enter保存并继续</div>
    </div>
  );
}

export default SaveButton;