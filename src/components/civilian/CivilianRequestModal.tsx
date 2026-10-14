import React, { useState } from 'react';
import { X, HelpCircle, CheckCircle2, ShieldAlert, PhoneCall, AlertCircle, Camera, Trash2 } from 'lucide-react';
import { CivilianRequest, RequestCategory, IncidentSeverity } from '../../types';

interface CivilianRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<CivilianRequest, 'id' | 'submittedAt' | 'updatedAt' | 'timeline' | 'status'>) => void;
  defaultCivilianName?: string;
  defaultPhone?: string;
  defaultCivilianId?: string;
}

export const CivilianRequestModal: React.FC<CivilianRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultCivilianName = 'Ananya Sharma',
  defaultPhone = '+91 98450 77123',
  defaultCivilianId = 'civ-demo-01'
}) => {
  const [category, setCategory] = useState<RequestCategory>('Medical Assistance');
  const [urgency, setUrgency] = useState<IncidentSeverity>('High');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [area, setArea] = useState('Millerpet');
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [contactPhone, setContactPhone] = useState(defaultPhone);
  const [civilianName, setCivilianName] = useState(defaultCivilianName);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [acknowledged112, setAcknowledged112] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setAttachmentError('Only image files (JPG, PNG, WebP) are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAttachmentError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAttachmentUrl(event.target!.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'Please describe the emergency assistance needed (min 10 characters).';
    }
    if (!locationName.trim()) {
      errs.locationName = 'Specific street address or landmark in Ballari is required.';
    }
    if (!contactPhone.trim() || contactPhone.replace(/\D/g, '').length < 10) {
      errs.contactPhone = 'Valid 10-digit phone number is required so responders can reach you.';
    }
    if (peopleCount < 1) {
      errs.peopleCount = 'Number of people must be at least 1.';
    }
    if (!acknowledged112) {
      errs.acknowledged112 = 'You must confirm that you have called 112 if life is in immediate danger.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      civilianId: defaultCivilianId || 'civ-demo-01',
      civilianName: civilianName.trim() || 'Citizen',
      contactPhone: contactPhone.trim(),
      category,
      urgency,
      description: description.trim(),
      locationName: locationName.trim(),
      area,
      peopleCount: Number(peopleCount),
      specialNeeds: specialNeeds.trim() || undefined,
      attachmentUrl: attachmentUrl || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Request Emergency Relief & Assistance</h3>
            <p className="text-xs text-slate-500">Ballari District Disaster Humanitarian Coordination</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 112 Urgent Warning Notice */}
        <div className="bg-red-50 border-b border-red-100 px-6 py-2.5 flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-red-600 shrink-0" />
            <span>Immediate life threat? Call <strong>112</strong> immediately.</span>
          </div>
          <a href="tel:112" className="font-bold text-red-700 underline text-xs">
            Dial 112
          </a>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assistance Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RequestCategory)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs"
              >
                <option value="Medical Assistance">Medical Assistance & Triage</option>
                <option value="Emergency Food & Ration">Food & Ration Packets</option>
                <option value="Potable Water">Potable Drinking Water</option>
                <option value="Rescue Evacuation">Rescue & Flood Evacuation</option>
                <option value="Emergency Shelter">Emergency Shelter Admission</option>
                <option value="General Supplies">General Relief Supplies / Blankets</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Urgency Level *</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as IncidentSeverity)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs font-medium"
              >
                <option value="Critical">Critical (Immediate danger to life)</option>
                <option value="High">High (Urgent within 2-4 hours)</option>
                <option value="Medium">Medium (Within 12 hours)</option>
                <option value="Low">Low (General humanitarian need)</option>
              </select>
            </div>
          </div>

          {/* People Count & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">People in Need *</label>
              <input
                type="number"
                min="1"
                max="100"
                value={peopleCount}
                onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
              />
              {errors.peopleCount && <p className="text-red-600 text-[11px] mt-0.5">{errors.peopleCount}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Ballari Ward / Locality *</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
              >
                <option value="Millerpet">Millerpet</option>
                <option value="Cowl Bazaar">Cowl Bazaar</option>
                <option value="Brucepet">Brucepet</option>
                <option value="Gandhi Nagar">Gandhi Nagar</option>
                <option value="APMC Yard">APMC Yard / Anantapur Rd</option>
                <option value="Siruguppa Highway">Siruguppa Highway</option>
                <option value="Toranagallu">Toranagallu Corridor</option>
                <option value="Kolagal">Kolagal Rural Belt</option>
                <option value="Ballari Urban">Other Ballari Urban</option>
              </select>
            </div>
          </div>

          {/* Street Address / Landmark */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Exact Address / Landmark in Ballari *</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Millerpet Canal Road, Near Vinayaka Temple, House #14"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
            />
            {errors.locationName && <p className="text-red-600 text-[11px] mt-0.5">{errors.locationName}</p>}
          </div>

          {/* Situation Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assistance Requirements & Condition *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe situation, trapped floor level, medical conditions, clean water status..."
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
            />
            {errors.description && <p className="text-red-600 text-[11px] mt-0.5">{errors.description}</p>}
          </div>

          {/* Special Needs */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vulnerable Individuals / Special Needs (Optional)</label>
            <input
              type="text"
              value={specialNeeds}
              onChange={(e) => setSpecialNeeds(e.target.value)}
              placeholder="e.g. 1 infant needing milk, 1 elderly on wheelchair, oxygen cylinder required"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
            />
          </div>

          {/* Photo Verification Attachment */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Photo Verification / Medical Prescription (Optional)</span>
              <span className="text-[11px] font-normal text-slate-500 lowercase">max 5MB</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer bg-slate-50/50">
                <Camera className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium">Attach photo of stranded location, flood water, or prescription</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {attachmentError && (
                <p className="text-xs text-red-600 font-medium">{attachmentError}</p>
              )}

              {attachmentUrl && (
                <div className="flex items-center gap-2.5 pt-1">
                  <div className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                    <img src={attachmentUrl} alt="Attached verification" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachmentUrl(null)}
                      className="absolute inset-0 bg-red-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500">Image attached for responders</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
              <input
                type="text"
                value={civilianName}
                onChange={(e) => setCivilianName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone (for dispatch team) *</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 9XXXXXXXXX"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
              />
              {errors.contactPhone && <p className="text-red-600 text-[11px] mt-0.5">{errors.contactPhone}</p>}
            </div>
          </div>

          {/* Mandatory Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged112}
                onChange={(e) => setAcknowledged112(e.target.checked)}
                className="mt-0.5 accent-blue-600 rounded text-blue-600"
              />
              <span className="text-slate-600 text-[11px] leading-snug">
                I understand this request is reviewed by the Ballari DDMA disaster desk. If this is an immediate life emergency, I have called <strong>112</strong>.
              </span>
            </label>
            {errors.acknowledged112 && (
              <p className="text-red-600 text-[11px] mt-0.5">{errors.acknowledged112}</p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors"
            >
              Submit Assistance Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
