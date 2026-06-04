import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full py-6 px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="6" width="18" height="12" rx="2" stroke="#2B6CB0" strokeWidth="1.5"/>
            <path d="M3 10h18" stroke="#2B6CB0" strokeWidth="1.5"/>
          </svg>
        </div>
        <span className="font-semibold text-lg">OnBoarding Digital</span>
      </div>

      <div className="flex items-center gap-4">
        <a className="text-sm text-zinc-700" href="#">Entrar</a>
        <a
          className="text-sm bg-blue-500 text-white px-4 py-2 rounded-full shadow-sm"
          href="#"
        >
          Cadastrar
        </a>
      </div>
    </header>
  );
}
