import { NavLink } from "react-router-dom";

interface NavItemProps {
  readonly to: string;
  readonly icon: string;
  readonly label: string;
}

export default function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <li className="p-[4px] hover:bg-[rgb(255,255,255,0.5)] rounded-lg transition-all pl-4">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex space-x-2 items-center text-[rgb(255,255,255,0.7)] w-full p-[4px] rounded-lg transition-all ${
            isActive ? "bg-[rgb(255,255,255,0.5)]" : "hover:bg-[rgb(255,255,255,0.5)]"
          }`
        }
      >
        <img className="w-4 h-4 self-center invert" src={icon} alt="" />
        <p className="hidden group-hover:inline-block text-xs transition-opacity duration-300">{label}</p>
      </NavLink>
    </li>
  );
}
