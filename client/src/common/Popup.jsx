import "./Popup.css";

function Popup ({children, onClose}) {
  return (
    <>
      <div className="overlay" />
      <div className="popup">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="mt-3">
          {children}
        </div>
      </div>
    </>
  );
}

export default Popup;