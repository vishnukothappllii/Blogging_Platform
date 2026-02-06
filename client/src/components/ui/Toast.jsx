import { X } from "lucide-react"

export function Toast({ toast, onDismiss }) {
  const variantStyles = {
    default: "bg-white border-gray-200",
    success: "bg-green-50 border-green-200 text-green-800",
    destructive: "bg-red-50 border-red-200 text-red-800",
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm ${variantStyles[toast.variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold">{toast.title}</h4>
          <p className="text-sm mt-1">{toast.description}</p>
        </div>
        <button onClick={() => onDismiss(toast.id)} className="ml-4 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
