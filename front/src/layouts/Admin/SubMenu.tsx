import { useState } from "react";
import vinetas from "../../assets/vineta-01-01.png";

interface SubMenuProps {
  readonly icon: string;
  readonly label: string;
  readonly children: React.ReactNode;
}

export default function SubMenu({ icon, label, children }: SubMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <ul>
      <li className="w-full p-[4px] hover:bg-[rgb(255,255,255,0.4)] rounded-lg transition-all group pl-2">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center space-x-4 text-base font-semibold text-[rgb(255,255,255,0.7)] focus:outline-none"
          aria-expanded={open}
        >
          <div className="self-center flex">
           <img
            className={`w-3 h-3 self-center transition-transform duration-300 ${open ? "rotate-[90deg]" : "rotate-0"}`}
            src={vinetas}
            alt=""
            />
            <img className="w-5 h-5 self-center invert" src={icon} alt="" />
          </div>
          <p className="self-center hidden text-sm group-hover:inline-block transition-opacity duration-300">
            {label}
          </p>
        </button>
      </li>
      {open && <ul className="pl-4">{children}</ul>}
    </ul>
  );
}
