import React, { useState } from 'react';
import { X, Home, CheckCircle2 } from 'lucide-react';
import { Shelter, ShelterFacility } from '../../types';

interface NewShelterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shelter: Omit<Shelter, 'id' | 'status'>) => void;
}

export const NewShelterModal: React.FC<NewShelterModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Gandhi Nagar');
  const [latitude, setLatitude] = useState(15.1394);
  const [longitude, setLongitude] = useState(76.9214);
  const [totalCapacity, setTotalCapacity] = useState(300);
  const [currentOccupancy, setCurrentOccupancy] = useState(0);
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [facilities, setFacilities] = useState<ShelterFacility>({
    bedding: true,
    foodKitchen: true,
    medicalPost: false,
    cleanWater: true,
    powerBackup: true,
    childFriendly: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Shelter name is required.';
    if (!address.trim()) errs.address = 'Address is required.';
    if (totalCapacity <= 0) errs.totalCapacity = 'Capacity must be greater than 0.';
    if (currentOccupancy > totalCapacity) errs.currentOccupancy = 'Occupancy cannot exceed total capacity.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      address: address.trim(),
      area: area.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      totalCapacity: Number(totalCapacity),
      currentOccupancy: Number(currentOccupancy),
      facilities,
      contactPerson: contactPerson.trim() || 'Shelter Supervisor',
      contactPhone: contactPhone.trim() || '+91 83922 00000'
    });

    onClose();
  };

  const toggleFacility = (key: keyof ShelterFacility) => {
    setFacilities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Register Designated Relief Shelter</h3>
              <p className="text-xs text-slate-500">Ballari District Emergency Evacuation Site</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Shelter Facility Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Government Degree College Auditorium"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
            />
            {errors.name && <p className="text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ballari Locality / Ward *
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Brucepet, Millerpet, Cowl Bazaar"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Total Bed Capacity *
              </label>
              <input
                type="number"
                min="1"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
              />
              {errors.totalCapacity && <p className="text-red-600 mt-1">{errors.totalCapacity}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Street Address *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Near Fort Hill Road, Beside Bus Stand, Ballari"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
            />
            {errors.address && <p className="text-red-600 mt-1">{errors.address}</p>}
          </div>

          {/* Facilities Checkboxes */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Available Facilities On Site:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
              {[
                { key: 'bedding' as const, label: 'Bedding & Mattresses' },
                { key: 'foodKitchen' as const, label: 'Community Kitchen' },
                { key: 'medicalPost' as const, label: 'Medical First Aid Post' },
                { key: 'cleanWater' as const, label: 'Potable Water Purifier' },
                { key: 'powerBackup' as const, label: 'Diesel Power Backup' },
                { key: 'childFriendly' as const, label: 'Child & Family Zone' }
              ].map((fac) => (
                <label
                  key={fac.key}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    facilities[fac.key]
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={facilities[fac.key]}
                    onChange={() => toggleFacility(fac.key)}
                    className="accent-emerald-600"
                  />
                  <span>{fac.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 mb-1">Care Supervisor Name</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Smt. Lakshmi"
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
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-colors"
            >
              Save Relief Shelter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
