import Link from "next/link";
import { characters } from "@/lib/characters";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 selection:bg-orange-500/30">
      {/* Hero Header */}
      <div className="max-w-6xl mx-auto mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500">
          AI Warriors of India
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto italic">
          "Engage with the legends. Seek the wisdom of the past, forged in code."
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {characters.map((char) => (
          <Link key={char.id} href={`/chat/${char.id}`} className="group block">
            <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:shadow-[0_0_30px_-10px_rgba(249,115,22,0.3)] hover:-translate-y-2">
              
              {/* Image Placeholder with Gradient Overlay */}
              <div className="relative w-full h-56 bg-slate-800">
                 {/* Replace this div with an actual <img /> or <Image /> component */}
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
                 <div className="flex items-center justify-center h-full text-slate-600 font-bold tracking-widest text-sm uppercase">
                    {char.name} 
                 </div>
              </div>

              {/* Card Content */}
              <div className="p-5 relative z-20">
                <h2 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">
                  {char.name}
                </h2>
                <div className="h-px w-12 bg-orange-600 mb-4" /> {/* Decorative Divider */}
                
                <p className="text-sm text-slate-400 italic mb-3">
                  {char.about}
                </p>

                <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 opacity-80">
                  {char.description}
                </p>

                <div className="mt-6 flex justify-end">
                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full group-hover:bg-orange-500/10">
                    Engage
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}