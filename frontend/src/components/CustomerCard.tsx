import { FiShoppingBag, FiTrendingUp } from "react-icons/fi";

const CustomerCard = ({ customer }: { customer: any }) => {
  return (
    <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <img
            src={customer.image || "https://ui-avatars.com/api/?name=" + customer.name}
            className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-50 group-hover:border-primary/20 transition-colors"
            alt={customer.name}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">{customer.name}</h3>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{customer.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-primary/[0.02] transition-colors">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <FiShoppingBag size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
          </div>
          <p className="text-xl font-black text-slate-800">{customer.totalOrders || 0}</p>
        </div>
        
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-green/[0.02] transition-colors">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <FiTrendingUp size={14} className="text-green-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Expenditure</span>
          </div>
          <p className="text-xl font-black text-slate-800">₹{customer.totalExpenditure?.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
          Joined {new Date(customer.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>

  );
};

export default CustomerCard;
