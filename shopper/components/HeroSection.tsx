export default function HeroSection() {
  return (
    <div className="mb-8 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20 px-8 py-16 text-center shadow-sm border border-gray-100/50 dark:border-gray-800/50 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-6 text-5xl font-semibold text-gray-900 dark:text-gray-50 md:text-6xl lg:text-7xl tracking-tight leading-tight">
          <span className="block">Welcome to</span>
          <span className="block font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-500 drop-shadow-sm">
            Ripple Mart
          </span>
        </h1>
        <p className="text-lg font-normal text-gray-600 dark:text-gray-400 md:text-xl leading-relaxed tracking-wide">
          Discover a shopping experience powered by the speed of Ripple.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-gray-300 to-gray-300 dark:via-gray-700 dark:to-gray-700"></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 dark:from-cyan-400 dark:to-blue-400 shadow-sm"></div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent via-gray-300 to-gray-300 dark:via-gray-700 dark:to-gray-700"></div>
        </div>
      </div>
    </div>
  );
}

