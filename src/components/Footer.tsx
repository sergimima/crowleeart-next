export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#0f172a] via-[#11383a] to-[#1e40af] text-white py-6 text-center border-t border-white/10 mt-10">
      <p className="text-sm opacity-80">
        &copy; {new Date().getFullYear()} Crowlee Art — The Art Of Maintenance — All rights reserved.
      </p>
    </footer>
  )
}
