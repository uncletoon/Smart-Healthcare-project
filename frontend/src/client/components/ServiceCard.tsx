import { MapPin, Building2 } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import DistanceBadge from "./DistanceBadge";

export interface Service {
  id: string | number;
  image: string;
  title: string;
  clinic: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full"
      id={`service-card-${service.id}`}
      style={{
        boxShadow:
          "0 0 16px rgba(0, 77, 64, 0.35), 0 4px 8px rgba(0, 77, 64, 0.15)",
      }}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="p-5 flex flex-col grow">
        <h3 className="text-lg font-bold text-primary leading-tight mb-4">
          {service.title}
        </h3>

        <div className="flex items-center gap-1 text-primary text-sm mb-2">
          <Building2 className="w-4 h-4 text-primary" />
          <span>{service.clinic}</span>
        </div>

        <div className="flex items-center justify-between gap-2 text-primary text-sm mb-6">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{service.location}</span>
          </div>
          <DistanceBadge
            latitude={service.latitude}
            longitude={service.longitude}
          />
        </div>

        <div className="mt-auto space-y-2">
          
          <Link
            to={`/services/${service.id}`}
            className="w-full py-2.5 bg-primary hover:bg-primary/80 text-white border border-primary font-semibold rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            id={`details-btn-${service.id}`}
            style={{
              boxShadow:
                "0 0 4px rgba(0, 77, 64, 0.35), 0 4px 4px rgba(0, 77, 64, 0.15)",
            }}
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
