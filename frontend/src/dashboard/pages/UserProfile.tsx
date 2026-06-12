import React, { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { Hospital, Mail, Phone, MapPin, Clock, FileText, CheckCircle } from "lucide-react";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";

export default function UserProfile() {
  const [formData, setFormData] = useState({
    name: "Kigali Heights Pharmacy",
    type: "Pharmacy",
    email: "kigaliheights@pharmacy.rw",
    phone: "+250 788 123 456",
    location: "Gasabo, Kigali",
    address: "Kigali Heights, Ground Floor, KG 7 Ave",
    hours: "24/7",
    description: "Kigali Heights Pharmacy is a modern, customer-centered community pharmacy committed to providing high-quality prescription medication, over-the-counter drugs, immunizations, and general health consultations.",
  });

  const [saved, setSaved] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saved Facility Settings: ", formData);
    setSaved(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <>
      <PageMeta
        title="Facility Profile Settings | Smart Healthcare"
        description="Edit public description, contact details, physical address, and hours for your clinic or pharmacy."
      />
      <PageBreadcrumb pageTitle="Facility Profile" />

      {saved && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl shadow-theme-sm transition animate-fade-in">
          <CheckCircle className="shrink-0 size-6" />
          <div>
            <p className="font-semibold text-sm">Settings Saved Successfully!</p>
            <p className="text-xs text-green-600">Your facility profile updates have been registered and saved.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        {/* Banner Card */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-theme-xs">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-teal-50 dark:bg-teal-950/20 border border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-center">
              <Hospital className="w-12 h-12 text-teal-600" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {formData.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formData.type} &bull; {formData.location}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-1.5 mt-2.5">
                <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-500 uppercase">Live on Registry</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Metadata */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-theme-xs space-y-5">
            <h4 className="text-base font-bold text-gray-800 dark:text-white/90 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <FileText className="text-brand-500 size-5" />
              General Details
            </h4>

            <div>
              <Label>Facility Name *</Label>
              <Input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Kigali Heights Pharmacy"
              />
            </div>

            <div>
              <Label>Facility Type *</Label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
              >
                <option value="Pharmacy">Pharmacy</option>
                <option value="Clinic">Clinic</option>
                <option value="Hospital">Hospital</option>
                <option value="Health Center">Health Center</option>
              </select>
            </div>

            <div>
              <Label>Operating Hours *</Label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                <input
                  type="text"
                  name="hours"
                  required
                  value={formData.hours}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
                  placeholder="e.g. 24/7 or 08:00 AM - 10:00 PM"
                />
              </div>
            </div>
          </div>

          {/* Contact & Address Details */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-theme-xs space-y-5">
            <h4 className="text-base font-bold text-gray-800 dark:text-white/90 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <MapPin className="text-brand-500 size-5" />
              Contacts & Location
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label>Phone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Province & District *</Label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
              >
                <option value="Gasabo, Kigali">Gasabo, Kigali</option>
                <option value="Kicukiro, Kigali">Kicukiro, Kigali</option>
                <option value="Nyarugenge, Kigali">Nyarugenge, Kigali</option>
                <option value="Rubavu, Western Province">Rubavu, Western Province</option>
                <option value="Huye, Southern Province">Huye, Southern Province</option>
                <option value="Musanze, Northern Province">Musanze, Northern Province</option>
                <option value="Kayonza, Eastern Province">Kayonza, Eastern Province</option>
              </select>
            </div>

            <div>
              <Label>Physical Address / Street *</Label>
              <Input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g. Kigali Heights, KG 7 Ave, Gasabo"
              />
            </div>
          </div>
        </div>

        {/* Bio / Description Card */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-theme-xs">
          <Label>Facility Bio / Description</Label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white mt-2 resize-none"
            placeholder="Tell patients about your medical specialties, staff credentials, or insurance details..."
          />
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reset Settings
          </Button>
          <Button type="submit">
            Save Profile Settings
          </Button>
        </div>
      </form>
    </>
  );
}
