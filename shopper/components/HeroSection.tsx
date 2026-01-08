export default function HeroSection() {
  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50 dark:from-gray-800/50 dark:via-gray-800 dark:to-gray-900/50 px-6 py-8 text-center border border-gray-200/60 dark:border-gray-700/50">
      <div className="max-w-2xl mx-auto">
        <h1 className="mb-3 text-3xl font-semibold text-gray-800 dark:text-gray-100 md:text-4xl tracking-tight leading-tight">
          <span className="block font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-500">
            A Ripple-Native E-Commerce Platform
          </span>
        </h1>
        <p className="text-sm font-normal text-gray-600 dark:text-gray-400 md:text-base leading-relaxed">
          Discover a shopping experience powered by the speed of Ripple.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-gray-300 to-gray-300 dark:via-gray-600 dark:to-gray-600"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 dark:from-cyan-400 dark:to-blue-400"></div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent via-gray-300 to-gray-300 dark:via-gray-600 dark:to-gray-600"></div>
        </div>
      </div>
    </div>
  );
}

