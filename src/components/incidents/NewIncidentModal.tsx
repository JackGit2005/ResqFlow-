import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, CheckCircle2, Camera, Upload, Trash2, Image } from 'lucide-react';
import { Incident, IncidentSeverity, IncidentType } from '../../types';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incident: Omit<Incident, 'id' | 'reportedAt' | 'timeline' | 'assignedResourceIds'>) => void;
}

const BALLARI_PRESET_AREAS = [
  { name: 'Cowl Bazaar Railway Gate', lat: 15.1322, lng: 76.9095, area: 'Cowl Bazaar' },
  { name: 'Millerpet Canal Road', lat: 15.1482, lng: 76.9288, area: 'Millerpet' },
  { name: 'Brucepet Main Market', lat: 15.1381, lng: 76.9255, area: 'Brucepet' },
  { name: 'Siruguppa Highway Junction', lat: 15.1725, lng: 76.9421, area: 'Siruguppa Highway' },
  { name: 'APMC Market Yard Gate 2', lat: 15.1278, lng: 76.9385, area: 'APMC Yard' },
  { name: 'Gandhi Nagar 4th Cross', lat: 15.1438, lng: 76.9189, area: 'Gandhi Nagar' },
  { name: 'Toranagallu Industrial Corridor', lat: 15.1889, lng: 76.8122, area: 'Toranagallu' },
  { name: 'Kolagal Gram Panchayat Belt', lat: 15.1092, lng: 76.9205, area: 'Kolagal' },
  { name: 'VIMS Cantonment Circle', lat: 15.1408, lng: 76.9069, area: 'Cantonment' }
];

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState<IncidentType>('Flood / Waterlogging');
  const [severity, setSeverity] = useState<IncidentSeverity>('High');
  const [locationName, setLocationName] = useState(BALLARI_PRESET_AREAS[0].name);
  const [area, setArea] = useState(BALLARI_PRESET_AREAS[0].area);
  const [latitude, setLatitude] = useState(BALLARI_PRESET_AREAS[0].lat);
  const [longitude, setLongitude] = useState(BALLARI_PRESET_AREAS[0].lng);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handlePresetChange = (areaName: string) => {
    const preset = BALLARI_PRESET_AREAS.find((p) => p.name === areaName);
    if (preset) {
      setLocationName(preset.name);
      setArea(preset.area);
      setLatitude(preset.lat);
      setLongitude(preset.lng);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }
    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'Please provide detailed situational description (min 10 characters).';
    }
    if (!locationName.trim()) {
      errs.locationName = 'Location is required.';
    }
    if (isNaN(latitude) || latitude < 14.5 || latitude > 16.0) {
      errs.latitude = 'Latitude must be in Ballari region (approx 15.0 - 15.5).';
    }
    if (isNaN(longitude) || longitude < 76.0 || longitude > 77.5) {
      errs.longitude = 'Longitude must be in Ballari region (approx 76.5 - 77.2).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setPhotoError('Only image files (JPG, PNG, WebP) are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPhotos((prev) => [...prev, event.target!.result as string]);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      incidentType,
      severity,
      locationName: locationName.trim(),
      area: area.trim() || 'Ballari Urban',
      latitude: Number(latitude),
      longitude: Number(longitude),
      status: 'Open',
      reporterName: reporterName.trim() || 'Control Officer',
      reporterContact: reporterContact.trim() || 'DDMA Internal Control',
      isPublicReport: false,
      photos: photos.length > 0 ? photos : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Log New Emergency Incident</h3>
              <p className="text-xs text-slate-500">Ballari Emergency Operations Coordination</p>
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
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Incident Headline / Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flash Flood Water Inundation in Millerpet Ward 18"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
            />
            {errors.title && <p className="text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Type & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Incident Category *
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
              >
                <option value="Flood / Waterlogging">Flood / Waterlogging</option>
                <option value="Structural Collapse">Structural Collapse</option>
                <option value="Fire Emergency">Fire Emergency</option>
                <option value="Road Accident">Road Accident</option>
                <option value="Chemical / Industrial Hazard">Chemical / Industrial Hazard</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Power Grid Failure">Power Grid Failure</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Severity Level *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-semibold"
              >
                <option value="Critical" className="text-red-600 font-bold">Critical (Immediate dispatch)</option>
                <option value="High" className="text-orange-600 font-semibold">High (Urgent response)</option>
                <option value="Medium" className="text-amber-600">Medium (Priority triage)</option>
                <option value="Low" className="text-emerald-600">Low (Standby observation)</option>
              </select>
            </div>
          </div>

          {/* Location Quick Select & Custom Coordinates */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> Ballari Geographic Coordinates
              </span>
              <span className="text-[11px] text-slate-500">Select hotspot or enter lat/lon</span>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Select Landmark:</label>
              <select
                value={locationName}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600"
              >
                {BALLARI_PRESET_AREAS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.area})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description & Casualties *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details of trapped victims, water levels, road blocks, hazards..."
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
            />
            {errors.description && <p className="text-red-600 mt-1">{errors.description}</p>}
          </div>

          {/* Reporter details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 mb-1">Reporting Officer Name</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. Ward Officer Ramesh"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Phone Number</label>
              <input
                type="tel"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="+91 94480 00000"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900"
              />
            </div>
          </div>

          {/* Incident Photo Attachment */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Incident Photos & Damage Evidence</span>
              <span className="text-[11px] font-normal text-slate-500 lowercase">(optional, max 5MB)</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer bg-slate-50/50">
                <Camera className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium">Attach photo evidence from device or camera</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photoError && (
                <p className="text-xs text-red-600 font-medium">{photoError}</p>
              )}

              {photos.length > 0 && (
                <div className="flex items-center gap-2.5 flex-wrap pt-1">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                      <img src={p} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute inset-0 bg-red-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <span className="text-[11px] text-slate-500">
                    {photos.length} {photos.length === 1 ? 'image' : 'images'} attached
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
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
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs transition-colors"
            >
              Log Emergency Incident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
