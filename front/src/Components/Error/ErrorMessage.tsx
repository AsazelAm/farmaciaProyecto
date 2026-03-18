export default function ErrorMessage({ children }: { readonly children: React.ReactNode }) {
    return (
      <div className="bg-red-600 p-[2px] rounded-xl text-xs shadow-lg text-center text-white">
        {children}
      </div>
    );
  }
  