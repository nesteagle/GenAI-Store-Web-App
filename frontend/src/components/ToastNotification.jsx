export default function ToastNotification({ message, type = "success", onClose }) {
  return (
    <div
      className={`
        px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2
        transition
        ${type === "success" ? "bg-success text-text-white" : ""}
        ${type === "error" ? "bg-error text-text-white" : ""}
      `}
      role="alert"
    >
      {message}
      <button onClick={onClose} className="ml-4 text-lg font-bold">&times;</button>
    </div>
  );
}