import { useNavigate } from "react-router-dom";

type props = {
  id: string;
  image: string;
  name: string;
  description?: string;
  distance: string;
  isOpen: boolean;
  deliveryTime?: string;
};

const RestaurantCard = ({
  id,
  image,
  name,
  description,
  distance,
  isOpen,
}: props) => {
  const navigate = useNavigate();

  return (
    <div
      className={`bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer group flex flex-col border border-outline-variant/10 ${!isOpen ? "opacity-75 grayscale-[20%]" : ""}`}
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      {/* Image Section */}
      <div className="relative h-56 w-full overflow-hidden bg-surface-container">
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out`}
        />

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isOpen ? (
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-black text-[10px] uppercase tracking-widest text-on-surface">Open Now</span>
            </div>
          ) : (
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="font-black text-[10px] uppercase tracking-widest text-white">Closed</span>
            </div>
          )}
        </div>

      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-display-lg text-xl font-black italic tracking-tight text-on-surface truncate group-hover:text-primary transition-colors pr-2">
              {name}
            </h3>
          </div>
          <p className="text-on-surface-variant font-medium text-xs line-clamp-2 leading-relaxed opacity-70">
            {description || "No description available"}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-outline-variant/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-primary/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[14px]">location_on</span>
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest text-on-surface/60">{distance} KM</span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
