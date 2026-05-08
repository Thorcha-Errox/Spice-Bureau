const LoadingSpinner = ({ fullScreen = false }: { fullScreen?: boolean }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-[3px] border-primary/5"></div>
        <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin duration-700"></div>
        <div className="absolute inset-2 rounded-full border-[2px] border-secondary/20 border-b-secondary animate-spin-reverse"></div>
        <div className="absolute inset-[1.5rem] rounded-full bg-primary/10 animate-pulse"></div>
        <div className="absolute inset-[2.25rem] rounded-full bg-primary shadow-lg shadow-primary/20"></div>
      </div>

      <div className="flex flex-col items-center">
        <h3 className="font-display-lg text-2xl font-black italic tracking-tighter text-on-surface flex items-center gap-1">
          <span className="text-primary">SPICE</span>
          <span>BUREAU</span>
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex gap-0.5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.3em] font-black opacity-40">
            Loading Excellence
          </p>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-surface flex items-center justify-center animate-in fade-in duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(183,16,42,0.03)_0%,transparent_70%)]"></div>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
