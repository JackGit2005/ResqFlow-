import React, { useState } from 'react';
import { X, Truck, CheckCircle2 } from 'lucide-react';
import { ResourceCategory, ResourceItem } from '../../types';

interface NewResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resource: Omit<ResourceItem, 'id' | 'assignedIncidentIds' | 'lastUpdated'>) => void;
}

export const NewResourceModal: React.FC<NewResourceModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Ambulance');
  const [typeDetails, setTypeDetails] = useState('');
  const [totalQuantity, setTotalQuantity] = useState(5);
  const [unit, setUnit] = useState('Vehicles');
  const [baseLocation, setBaseLocation] = useState('Cantonment Depot, Ballari');
  const [latitude, setLatitude] = useState(15.1394);
  const [longitude, setLongitude] = useState(76.9214);
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleCategoryChange = (cat: ResourceCategory) => {
    setCategory(cat);
    if (cat === 'Ambulance') setUnit('Vehicles');
    else if (cat === 'Rescue Team') setUnit('Platoons (10-12 pax)');
    else if (cat === 'Volunteer Group') setUnit('Volunteers');
    else if (cat === 'Medical Supplies') setUnit('Kits');
    else if (cat === 'Food & Ration') setUnit('Meal Packs');
    else if (cat === 'Potable Water') setUnit('Tankers (10,000L)');
    else if (cat === 'Rescue Equipment') setUnit('Units / Sets');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Resource name is required.';
    if (totalQuantity <= 0) errs.totalQuantity = 'Total quantity must be greater than 0.';
    if (!baseLocation.trim()) errs.baseLocation = 'Base station location is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      category,
      typeDetails: typeDetails.trim() || 'Standard operational deployment unit',
      totalQuantity: Number(totalQuantity),
      availableQuantity: Number(totalQuantity),
      unit,
      baseLocation: baseLocation.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      status: 'Ready',
      contactPerson: contactPerson.trim() || 'Base Duty Officer',
      contactPhone: contactPhone.trim() || '+91 83922 00000'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Register Resource / Fleet</h3>
              <p className="text-xs text-slate-500">Add emergency equipment or squad to Ballari inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Resource / Unit Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 108 BLS Ambulance Fleet Beta"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
            />
            {errors.name && <p className="text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ResourceCategory)}
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
              >
                <option value="Ambulance">Ambulance</option>
                <option value="Rescue Team">Rescue Team</option>
                <option value="Volunteer Group">Volunteer Group</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Food & Ration">Food & Ration</option>
                <option value="Potable Water">Potable Water</option>
                <option value="Rescue Equipment">Rescue Equipment</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Total Quantity & Unit *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Unit (e.g. Kits, Vehicles)"
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                />
              </div>
              {errors.totalQuantity && <p className="text-red-600 mt-1">{errors.totalQuantity}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Specification / Capabilities Description
            </label>
            <input
              type="text"
              value={typeDetails}
              onChange={(e) => setTypeDetails(e.target.value)}
              placeholder="e.g. High-pressure pumps, oxygen cylinders, rescue tools..."
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Base Station / Depot Location in Ballari *
            </label>
            <input
              type="text"
              value={baseLocation}
              onChange={(e) => setBaseLocation(e.target.value)}
              placeholder="e.g. Brucepet Fire Station / VIMS Medical Depot"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
            />
            {errors.baseLocation && <p className="text-red-600 mt-1">{errors.baseLocation}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 mb-1">Contact Officer Name</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Commander Ramesh"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Phone Number</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 94480 00000"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors"
            >
              Add to Resource Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
