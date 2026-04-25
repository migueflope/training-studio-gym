export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6 text-xs text-zinc-500">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div>© {new Date().getFullYear()} Training Studio Gym. Cartagena, Colombia.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">Facebook</a>
        </div>
      </div>
    </footer>
  );
}
