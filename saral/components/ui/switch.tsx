import React from "react"

interface SwitchProps {
  id?: string // 
  checked: boolean
  onChange: (checked: boolean) => void // 
}

export const Switch: React.FC<SwitchProps> = ({ id, checked, onChange }) => {
  return (
    <label
      htmlFor={id}
      className="relative inline-flex cursor-pointer items-center"
    >
      <input
        id={id} 
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)} 
        className="peer sr-only"
      />
      <div
        className={`peer h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 ${
          checked ? "peer-checked:bg-blue-600" : ""
        }`}
      ></div>
      <div
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
          checked ? "translate-x-5" : ""
        }`}
      ></div>
    </label>
  )
}

export default Switch
