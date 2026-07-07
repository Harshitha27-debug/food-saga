import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanner } from '../context/PlannerContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, Plus, Trash2, Printer, Check, 
  Square, CheckSquare, RefreshCw, X 
} from 'lucide-react';
import Loader from '../components/Loader';

const ShoppingList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const { 
    shoppingList, fetchShoppingList, addShoppingItem, 
    updateShoppingItem, deleteShoppingItem, clearShoppingList 
  } = usePlanner();

  const [newItemName, setNewItemName] = useState('');
  const [newItemAmt, setNewItemAmt] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchShoppingList();
  }, [token]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setLoading(true);
    await addShoppingItem(newItemName.trim(), newItemAmt.trim());
    setNewItemName('');
    setNewItemAmt('');
    setLoading(false);
  };

  const handleToggleCompleted = async (itemId, completedState) => {
    await updateShoppingItem(itemId, { completed: !completedState });
  };

  const handleDeleteItem = async (itemId) => {
    await deleteShoppingItem(itemId);
  };

  const handleClearAll = async (completedOnly = false) => {
    if (window.confirm(completedOnly ? 'Clear all completed items?' : 'Are you sure you want to empty your entire shopping list?')) {
      await clearShoppingList(completedOnly);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const listItems = shoppingList.items || [];
  const activeItems = listItems.filter(i => !i.completed);
  const completedItems = listItems.filter(i => i.completed);

  return (
    <div className="flex flex-col gap-8 text-left max-w-2xl mx-auto w-full">
      
      {/* HEADER SECTION */}
      <section className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-display font-bold">Shopping List</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage ingredients, ticks, and print lists.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="p-2.5 glass-card rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 flex items-center gap-1.5 text-xs font-bold"
            title="Print / Save PDF"
          >
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
        </div>
      </section>

      {/* PRINT ONLY BRAND HEADER */}
      <section className="hidden print:block border-b-2 border-slate-350 pb-4 mb-6">
        <h1 className="text-2xl font-display font-bold">Food Saga - Grocery Checklist</h1>
        <p className="text-xs text-slate-500 mt-1">Generated on {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
      </section>

      {/* ADD ITEM MANUAL FORM (HIDDEN DURING PRINT) */}
      <section className="glass rounded-3xl p-5 border border-slate-200/50 print:hidden">
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-grow w-full flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. Tomato, Olive oil" 
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand"
            />
            <input 
              type="text" 
              placeholder="e.g. 3 pcs, 100ml" 
              value={newItemAmt}
              onChange={e => setNewItemAmt(e.target.value)}
              className="w-28 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </form>
      </section>

      {/* ACTIONS BUTTONS ROW (HIDDEN DURING PRINT) */}
      {listItems.length > 0 && (
        <section className="flex gap-2 justify-end print:hidden text-xs">
          <button 
            onClick={() => handleClearAll(true)}
            className="py-2 px-3 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-550 font-bold"
          >
            Clear Completed
          </button>
          <button 
            onClick={() => handleClearAll(false)}
            className="py-2 px-3 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl font-bold"
          >
            Clear All
          </button>
        </section>
      )}

      {/* MAIN CHECKLIST GROUPS */}
      <section className="flex flex-col gap-6">
        {listItems.length === 0 ? (
          <div className="p-16 text-center glass rounded-3xl mt-2">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">Your list is empty</h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Add items manually or schedule meals in your calendar to populate ingredients.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            {/* Active Items */}
            {activeItems.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <h4 className="font-display font-bold text-xs text-slate-450 uppercase tracking-wider mb-1 print:hidden">Remaining Items ({activeItems.length})</h4>
                {activeItems.map(item => (
                  <div 
                    key={item._id} 
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm group hover:border-slate-200 transition-all"
                  >
                    <div 
                      onClick={() => handleToggleCompleted(item._id, item.completed)}
                      className="flex items-center gap-3 cursor-pointer flex-grow min-w-0"
                    >
                      <button className="text-slate-400 hover:text-brand shrink-0">
                        <Square className="w-5 h-5" />
                      </button>
                      <span className="font-semibold text-xs text-slate-750 dark:text-slate-200 truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.amount && (
                        <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-slate-850">{item.amount}</span>
                      )}
                      <button 
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-1.5 rounded-lg text-slate-450 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 print:hidden"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed items (collapsible/faded out) */}
            {completedItems.length > 0 && (
              <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-850 pt-5 mt-3 print:hidden">
                <h4 className="font-display font-bold text-xs text-slate-450 uppercase tracking-wider mb-1">Purchased ({completedItems.length})</h4>
                {completedItems.map(item => (
                  <div 
                    key={item._id} 
                    className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-850 rounded-2xl flex items-center justify-between shadow-xs opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <div 
                      onClick={() => handleToggleCompleted(item._id, item.completed)}
                      className="flex items-center gap-3 cursor-pointer flex-grow min-w-0"
                    >
                      <button className="text-brand shrink-0">
                        <CheckSquare className="w-5 h-5 fill-brand/10" />
                      </button>
                      <span className="font-semibold text-xs text-slate-700 dark:text-slate-450 line-through truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.amount && (
                        <span className="px-2.5 py-1 bg-slate-100/50 dark:bg-slate-950 text-slate-400 text-[10px] font-bold rounded-lg line-through">{item.amount}</span>
                      )}
                      <button 
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </section>

    </div>
  );
};

export default ShoppingList;
