import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Lock,
  Eye,
  Send,
  Info,
  Camera,
  Trash2
} from 'lucide-react';
import { Incident, IncidentSeverity, IncidentType } from '../../types';
import { BALLARI_CENTER } from '../../data/initialData';

interface PublicReportingViewProps {
  incidents: Incident[];
  onSubmitPublicReport: (
    report: Omit<Incident, 'id' | 'reportedAt' | 'timeline' | 'assignedResourceIds'>
  ) => void;
}

export const PublicReportingView: React.FC<PublicReportingViewProps> = ({
  incidents,
  onSubmitPublicReport
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'feed'>('form');

  // Form State
  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState<IncidentType>('Flood / Waterlogging');
  const [severity, setSeverity] = useState<IncidentSeverity>('Medium');
  const [locationName, setLocationName] = useState('');
  const [area, setArea] = useState('Ballari Urban');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [acknowledged112, setAcknowledged112] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 5) {
      errs.title = 'Please provide a descriptive headline (min 5 characters).';
    }
    if (!locationName.trim()) {
      errs.locationName = 'Specific landmark or street location is required.';
    }
    if (!description.trim() || description.trim().length < 15) {
      errs.description = 'Please describe the emergency situation in detail (min 15 characters).';
    }
    if (reporterPhone.trim()) {
      const cleanPhone = reporterPhone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        errs.reporterPhone = 'Please enter a valid 10-digit Indian phone number (or leave blank).';
      }
    }
    if (!acknowledged112) {
      errs.acknowledged112 = 'You must acknowledge the 112 emergency notice before submitting.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmitPublicReport({
      title: title.trim(),
      description: description.trim(),
      incidentType,
      severity,
      locationName: locationName.trim(),
      area: area.trim(),
      latitude: BALLARI_CENTER.lat + (Math.random() - 0.5) * 0.04,
      longitude: BALLARI_CENTER.lng + (Math.random() - 0.5) * 0.04,
      status: 'Open',
      reporterName: reporterName.trim() || 'Citizen Report',
      reporterContact: reporterPhone.trim() || 'Not Provided',
      isPublicReport: true,
      photos: photos.length > 0 ? photos : undefined
    });

    setSubmittedSuccess(true);
    setTitle('');
    setDescription('');
    setLocationName('');
    setReporterName('');
    setReporterPhone('');
    setPhotos([]);
    setAcknowledged112(false);
    setErrors({});
  };

  const publicFeed = incidents.map((inc) => ({
    id: inc.id,
    title: inc.title,
    incidentType: inc.incidentType,
    area: inc.area,
    severity: inc.severity,
    status: inc.status,
    reportedAt: inc.reportedAt,
    isPublicReport: inc.isPublicReport
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 112 India Critical Emergency Notice Box */}
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-red-600 text-white shrink-0 shadow-xs">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-red-900 tracking-tight flex items-center gap-2">
              <span>FOR IMMEDIATE DANGER OR LIFE THREAT: CALL 112 FIRST</span>
            </h2>
            <p className="text-xs text-red-800 leading-relaxed">
              Submitting this online form alerts the Ballari District Disaster Management Authority (DDMA) coordination desk.
              <strong> This web form does NOT replace emergency voice dispatch.</strong> If there is an active fire, trapped casualties, or medical emergency, immediately dial India’s national emergency number <strong>112</strong> or <strong>108</strong> (Ambulance).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-red-200/80 text-xs">
          <a
            href="tel:112"
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Call 112 Directly
          </a>
          <span className="text-red-300">·</span>
          <span className="text-red-900 font-medium">Ballari DDMA Control Room: 08392-277100 / 1077</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'form'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Send className="w-4 h-4" />
          Submit Citizen Incident Report
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'feed'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          Public Situational Awareness Feed ({publicFeed.length})
        </button>
      </div>

      {activeTab === 'form' ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 max-w-3xl">
          {submittedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Emergency Report Transmitted Successfully</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Your report has been received into the Ballari Operations Room for triage. Dispatch teams have been alerted.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubmittedSuccess(false)}
                className="text-xs text-emerald-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div>
            <h2 className="text-base font-bold text-slate-900">Citizen Disaster & Hazard Report Form</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Report waterlogging, road blocks, collapses, fires, or humanitarian supply shortages in Ballari.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Headline */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Headline / Short Summary *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash flooding in Millerpet ward near railway bridge, 15 families cut off"
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
              />
              {errors.title && <p className="text-red-600 mt-1">{errors.title}</p>}
            </div>

            {/* Category & Perceived Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Incident Category *
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                >
                  <option value="Flood / Waterlogging">Flood / Waterlogging</option>
                  <option value="Structural Collapse">Structural Collapse</option>
                  <option value="Fire Emergency">Fire Emergency</option>
                  <option value="Road Accident">Road Accident</option>
                  <option value="Chemical / Industrial Hazard">Chemical / Gas Hazard</option>
                  <option value="Medical Emergency">Medical Outbreak / Mass Casualty</option>
                  <option value="Power Grid Failure">Power Line / Substation Failure</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated Urgency / Severity *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-semibold"
                >
                  <option value="Critical" className="text-red-600 font-bold">Critical (Immediate rescue needed)</option>
                  <option value="High" className="text-orange-600">High (High risk, worsening situation)</option>
                  <option value="Medium" className="text-amber-600">Medium (Assistance required)</option>
                  <option value="Low" className="text-emerald-600">Low (Informational / Hazard notice)</option>
                </select>
              </div>
            </div>

            {/* Location in Ballari */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Specific Landmark / Street *
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Near Fort Hill, Opposite St. Mary's School"
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
                />
                {errors.locationName && <p className="text-red-600 mt-1">{errors.locationName}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Ballari Ward / Locality *
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                >
                  <option value="Cowl Bazaar">Cowl Bazaar</option>
                  <option value="Millerpet">Millerpet</option>
                  <option value="Brucepet">Brucepet</option>
                  <option value="Gandhi Nagar">Gandhi Nagar</option>
                  <option value="APMC Yard">APMC Yard / Anantapur Rd</option>
                  <option value="Siruguppa Highway">Siruguppa Highway</option>
                  <option value="Toranagallu">Toranagallu Industrial Corridor</option>
                  <option value="Kolagal">Kolagal Rural Belt</option>
                  <option value="Ballari Urban">Ballari Other / Rural</option>
                </select>
              </div>
            </div>

            {/* Situation Details */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description of Hazards, Stranded People, or Injuries *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current water level, number of people trapped, smoke intensity, access obstructions..."
                className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
              />
              {errors.description && <p className="text-red-600 mt-1">{errors.description}</p>}
            </div>

            {/* Photo Upload Attachment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Attach Incident Photograph</span>
                <span className="text-[11px] font-normal text-slate-500 lowercase">(optional, JPG/PNG max 5MB)</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer bg-slate-50/50">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium">Select photo from device or camera</span>
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
                      {photos.length} {photos.length === 1 ? 'photo' : 'photos'} attached
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy protected contact info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold">Privacy Protection:</span>
                <span className="text-slate-500 text-[11px]">
                  Contact details are confidential and will never appear on public feeds.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Sri / Smt..."
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Phone Number for Verification (Optional)</label>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+91 9XXXXXXXXX"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                  {errors.reporterPhone && (
                    <p className="text-red-600 text-[11px] mt-1">{errors.reporterPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div className="space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged112}
                  onChange={(e) => setAcknowledged112(e.target.checked)}
                  className="mt-0.5 accent-blue-600 rounded"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  I understand this form submits an emergency coordination report to the district board,
                  and does <strong>not</strong> substitute for calling 112 if immediate rescue is required.
                </span>
              </label>
              {errors.acknowledged112 && (
                <p className="text-red-600 mt-1">{errors.acknowledged112}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors"
              >
                Transmit Emergency Report to Ballari Command Desk
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Public Transparency Feed */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Public Situational Awareness Portal · Personal contact data scrubbed for civilian privacy
            </span>
            <span className="font-mono text-blue-700 font-semibold">{publicFeed.length} incidents logged</span>
          </div>

          <div className="space-y-3">
            {publicFeed.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-slate-500 flex-wrap">
                    <span className="font-mono text-blue-700 font-semibold">{item.id}</span>
                    <span>·</span>
                    <span
                      className={`font-semibold ${
                        item.severity === 'Critical'
                          ? 'text-red-600'
                          : item.severity === 'High'
                          ? 'text-orange-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span>·</span>
                    <span className="text-slate-700">{item.incidentType}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(item.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>Area: {item.area}</span>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                      item.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {item.status === 'Resolved'
                      ? 'Situation Resolved'
                      : item.status === 'In Progress'
                      ? 'Response Deployed on Scene'
                      : 'Under Triage Review'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
