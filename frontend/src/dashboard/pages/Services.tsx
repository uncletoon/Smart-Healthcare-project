import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Badge from "../components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import { Search, Plus, Trash2, Edit, CheckCircle } from "lucide-react";
import { Modal } from "../components/ui/modal";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  cost: string;
  duration: string;
  status: "Active" | "Inactive";
  description: string;
}

const initialServices: ServiceItem[] = [
  {
    id: "1",
    name: "General Consultation",
    category: "General",
    cost: "10,000 RWF",
    duration: "20 mins",
    status: "Active",
    description: "Routine primary care checkup, vitals screening, and general medical advice.",
  },
  {
    id: "2",
    name: "Complete Blood Count (CBC)",
    category: "Laboratory",
    cost: "15,000 RWF",
    duration: "15 mins",
    status: "Active",
    description: "Full hematology blood screening panel performed by lab technicians.",
  },
  {
    id: "3",
    name: "COVID-19 PCR Testing",
    category: "Diagnostics",
    cost: "30,000 RWF",
    duration: "10 mins",
    status: "Active",
    description: "Standard nasal swab molecular test with digital certificate delivery.",
  },
  {
    id: "4",
    name: "Flu Vaccine Shot",
    category: "Immunization",
    cost: "8,000 RWF",
    duration: "10 mins",
    status: "Active",
    description: "Annual influenza immunization shot administered by nursing staff.",
  },
  {
    id: "5",
    name: "Dental Cleaning & Hygiene",
    category: "Dental",
    cost: "25,000 RWF",
    duration: "45 mins",
    status: "Inactive",
    description: "Scaling, polishing, and comprehensive oral health assessment.",
  },
];

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    cost: "",
    duration: "",
    status: "Active" as "Active" | "Inactive",
    description: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: "",
      category: "General",
      cost: "",
      duration: "",
      status: "Active",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      cost: service.cost,
      duration: service.duration,
      status: service.status,
      description: service.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this service?")) {
      setServices(prev => prev.filter(item => item.id !== id));
      triggerNotification("Service deleted successfully!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      // Update
      setServices(prev =>
        prev.map(item =>
          item.id === editingService.id
            ? { ...item, ...formData }
            : item
        )
      );
      triggerNotification("Service updated successfully!");
    } else {
      // Create
      const newService: ServiceItem = {
        id: Date.now().toString(),
        ...formData,
      };
      setServices(prev => [...prev, newService]);
      triggerNotification("New service registered successfully!");
    }
    setIsModalOpen(false);
  };

  const triggerNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const filteredServices = services.filter(
    item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageMeta
        title="Manage Facility Services | Smart Healthcare"
        description="Configure medical consultation, diagnostic, and pharmacy services offered at your facility."
      />
      <PageBreadcrumb pageTitle="Offered Services" />

      {successMessage && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl shadow-theme-sm transition animate-fade-in">
          <CheckCircle className="shrink-0 size-6" />
          <p className="font-semibold text-sm">{successMessage}</p>
        </div>
      )}

      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <span className="absolute -translate-y-1/2 left-3.5 top-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search services or categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-5 py-2.5 font-medium text-sm transition"
          >
            <Plus size={18} />
            Add Service
          </button>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Service Name & Description
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Category
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Cost
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Est. Duration
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-center text-theme-xs uppercase tracking-wider dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                    No services found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map(service => (
                  <TableRow key={service.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <TableCell className="px-5 py-4 max-w-sm">
                      <div>
                        <span className="block font-medium text-gray-800 dark:text-white/90 text-sm">
                          {service.name}
                        </span>
                        <span className="block text-theme-xs text-gray-400 truncate mt-0.5" title={service.description}>
                          {service.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300 text-sm">
                      {service.category}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-semibold text-gray-800 dark:text-white/90 text-sm">
                      {service.cost}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300 text-sm">
                      {service.duration}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        size="sm"
                        color={service.status === "Active" ? "success" : "error"}
                      >
                        {service.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(service)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-teal-600 transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          title="Delete Service"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* CRUD Modal Dialogue */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[600px] m-4">
        <div className="relative w-full p-6 bg-white dark:bg-gray-900 rounded-3xl">
          <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            {editingService ? "Edit Service details" : "Add New Service"}
          </h4>
          <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
            Fill in the parameters below to configure this service in the system catalog.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Service Name *</Label>
              <Input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., General Consultation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
                >
                  <option value="General">General</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Diagnostics">Diagnostics</option>
                  <option value="Immunization">Immunization</option>
                  <option value="Dental">Dental</option>
                  <option value="Specialist">Specialist</option>
                </select>
              </div>

              <div>
                <Label>Cost *</Label>
                <Input
                  type="text"
                  name="cost"
                  required
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="e.g., 12,000 RWF"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Est. Duration *</Label>
                <Input
                  type="text"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 20 mins"
                />
              </div>

              <div>
                <Label>Status *</Label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Indicate instructions, equipment required, or other specifics..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-gray-800 dark:text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button type="button" size="sm" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingService ? "Save Changes" : "Create Service"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
